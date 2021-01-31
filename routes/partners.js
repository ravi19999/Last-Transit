const express = require("express");
const router = express.Router();
const Partners = require("../models/partners");
const multer = require("multer");
const { authenticateToken } = require("./authentication");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/partners");
    },
    filename: function (req, file, cb) {
        let extension = "jpg";
        if (
            file.originalname.includes("jpg") ||
            file.originalname.includes("JPG")
        ) {
            extension = "jpg";
        } else if (file.originalname.includes("png")) {
            extension = "png";
        }
        cb(null, `partner-${Date.now().toString()}.${extension}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});

router.get("/", paginatedResults(Partners), async (req, res) => {
    try {
        res.json(res.paginatedResults);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:id", async (req, res) => {
    const partner = await Partners.findById(req.params.id);
    try {
        res.status(200).json({ results: partner });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", upload.single("logo"), async (req, res) => {
    const partner = new Partners({
        partnerName: req.body.partnerName,
        details: req.body.details,
        links: req.body.links,
        logo: req.file.path,
        address: req.body.address,
    });
    try {
        const newPartner = await partner.save();
        res.status(201).json(newPartner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch("/:id", upload.single("logo"), async (req, res) => {
    const doc = await Partners.findById(req.params.id);
    doc.partnerName = req.body.partnerName
        ? req.body.partnerName
        : doc.partnerName;
    doc.address = req.body.address ? req.body.address : doc.address;
    doc.logo = req.file ? req.file.path : doc.logo;
    doc.details = req.body.details ? req.body.details : doc.details;
    doc.facebook = req.body.facebook ? req.body.facebook : doc.facebook;
    doc.linkedin = req.body.linkedin ? req.body.linkedin : doc.facebook;
    doc.twitter = req.body.twitter ? req.body.twitter : doc.facebook;
    try {
        await doc.save();
        res.json(doc);
    } catch (err) {
        res.json({ error: err.message });
    }
});

router.delete("/:id", authenticateToken, getPartner, async (req, res) => {
    try {
        await res.partner.remove();
        res.json({ message: "removed partner" });
    } catch (err) {
        res.json({ message: err.message });
    }
});

async function getPartner(req, res, next) {
    let partner;
    try {
        partner = await Partners.findById(req.params.id);
        if (partner == null) {
            return res.status(404).json({ message: "Cannot find partner" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.partner = partner;
    next();
}

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {};

        if (endIndex < (await model.countDocuments().exec())) {
            results.next = {
                page: page + 1,
                limit: limit,
            };
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit,
            };
        }
        try {
            results.results = await model
                .find()
                .limit(limit)
                .skip(startIndex)
                .exec();
            res.paginatedResults = results;
            next();
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    };
}

module.exports = router;
