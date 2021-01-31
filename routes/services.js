const express = require("express");
const router = express.Router();
const Services = require("../models/services");
const multer = require("multer");
const { authenticateToken } = require("./authentication");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/services");
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
        cb(null, `product-${Date.now().toString()}.${extension}`);
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

router.get("/", paginatedResults(Services), async (req, res) => {
    try {
        res.status(200).json(res.paginatedResults);
    } catch (err) {
        res.status(500).json({ message: err.message, statusCode: 500 });
    }
});

router.get("/:id", async (req, res) => {
    try {
        let service = await Services.findById(req.params.id);
        console.log(service);
        res.json({ results: service });
    } catch (err) {
        res.json({ err: err.message });
    }
});

router.post("/", upload.single("serviceImage"),
    async (req, res) => {
        const path = req.file ? req.file.path : "";
        const {serviceName,category,details} = req.body.body
    
        const service = await new Services({
            serviceName,
            category,
            details,
            serviceImage,
        });
        try {
            const newService = await service.save();
            console.log(newService)
            res.status(201).json(newService);
        } catch (err) {
            console.log(err)
            res.status(400).json({ message: err.message });
        }
    }
);

router.patch("/:id", authenticateToken, async (req, res) => {
    const doc = await Services.findOne({ _id: req.params.id });
    doc.serviceName = req.body.serviceName
        ? req.body.serviceName
        : doc.serviceName;
    doc.category = req.body.category ? req.body.category : doc.category;
    doc.details = req.body.details ? req.body.details : doc.details;
    await doc.save();
    res.json({ doc, statusCode: 200 });
});

router.delete("/:id", authenticateToken, getService, async (req, res) => {
    try {
        await res.service.remove();
        res.json({
            results: res.service,
            message: "Deleted service",
            statusCode: 200,
        });
    } catch (err) {
        res.status(500).json({ message: err.message, statusCode: 500 });
    }
});

async function getService(req, res, next) {
    let service;
    try {
        service = await Services.findById(req.params.id);
        if (Service == null) {
            return res.status(404).json({ message: "Cannot find service" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.service = service;
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
