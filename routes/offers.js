const express = require("express");
const router = express.Router();
const Offers = require("../models/offers");
const multer = require("multer");
const { authenticateToken } = require("./authentication");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/offers");
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
        cb(null, `offer-${Date.now()}.${extension}`);
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

router.get("/", paginatedResults(Offers), async (req, res) => {
    try {
        res.status(200).json(res.paginatedResults);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:id", async (req, res) => {
    const offer = await Offers.findById(req.params.id);
    try {
        res.status(200).json({ results: offer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post(
    "/",
    authenticateToken,
    upload.single("image"),
    async (req, res) => {
        console.log(req.file);
        const offer = new Offers({
            name: req.body.name,
            details: req.body.details,
            image: req.file.path,
        });
        try {
            const newOffer = await offer.save();
            res.status(201).json(newOffer);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
);

router.patch(
    "/:id",
    authenticateToken,
    upload.single("image"),
    async (req, res) => {
        const doc = await Offers.findById(req.params.id);
        doc.name = req.body.name ? req.body.name : doc.name;
        doc.image = req.file ? req.file.path : doc.image;
        doc.details = req.body.details ? req.body.details : doc.details;
        doc.created = new Date();
        try {
            await doc.save();
            res.json(doc);
        } catch (err) {
            res.json({ error: err.message });
        }
    }
);

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        let offerToDelete = await Offers.findById(req.params.id);
        await offerToDelete.remove();
        res.json({ offerToDelete, message: "Offer deleted successfully!!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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
