const express = require("express");
const router = express.Router();
const Teams = require("../models/team");
const multer = require("multer");

const { authenticateToken } = require("./authentication");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/products");
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
        cb(null, `team-${Date.now().toString()}.${extension}`);
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

router.get("/", paginatedResults(Teams), async (req, res) => {
    try {
        res.json(res.paginatedResults);
    } catch (err) {
        res.status(500).json({ message: err.message, statusCode: 500 });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const team = await Teams.findById(req.params.id);
        res.status(200).json({ results: team });
    } catch (err) {
        res.status(404).json({ err: err.message });
    }
});

router.post(
    "/",
    authenticateToken,
    upload.single("image"),
    async (req, res) => {
        const team = await new Teams({
            name: req.body.name,
            image: req.file.path,
            position: req.body.position,
            description: req.body.description,
        });
        try {
            const newTeam = await team.save();
            res.json(newTeam);
        } catch (err) {
            res.json({ err: err.message });
        }
    }
);

router.patch(
    "/:id",
    authenticateToken,
    upload.single("logo"),
    async (req, res) => {
        const doc = await Teams.findById(req.params.id);
        doc.name = req.body.name ? req.body.name : doc.name;
        doc.image = req.file ? req.file.path : doc.image;
        doc.description = req.body.description
            ? req.body.description
            : doc.description;
        doc.position = req.body.position ? req.body.lposition : doc.position;
        try {
            await doc.save();
            res.json(doc);
        } catch (err) {
            res.json({ error: err.message });
        }
    }
);

router.delete("/:id", authenticateToken, getTeam, async (req, res) => {
    try {
        await res.team.remove();
        res.json({ message: "team member deleted successfully" });
    } catch (err) {
        res.json({ message: err.message });
    }
});

async function getTeam(req, res, next) {
    let product;
    try {
        product = await Teams.findById(req.params.id);
        if (product == null) {
            return res.status(404).json({ message: "Cannot find tean member" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.team = team;
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
