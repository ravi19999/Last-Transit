const express = require("express");
const router = express.Router();
const Products = require("../models/products");
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

router.get("/", paginatedResults(Products), async (req, res) => {
    try {
        res.json(res.paginatedResults);
    } catch (err) {
        res.status(500).json({ message: err.message, statusCode: 500 });
    }
});

router.get("/:id", async (req, res) => {
    const product = await Products.findById(req.params.id);
    res.send({ results: product });
});

router.post(
    "/",
    authenticateToken,
    upload.single("productImage"),
    async (req, res) => {
        console.log(req.file);
        const product = new Products({
            productName: req.body.productName,
            category: req.body.category,
            details: req.body.details,
            productImage: req.file ? req.file.path : "",
        });
        try {
            const newProduct = await product.save();
            res.status(201).json(newProduct);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
);

router.patch(
    "/:id",
    authenticateToken,
    upload.single("productImage"),
    async (req, res) => {
        console.log(req.body);
        const doc = await Products.findOne({ _id: req.params.id });
        doc.productName = req.body.productName
            ? req.body.productName
            : doc.productName;
        doc.details = req.body.details ? req.body.details : doc.details;
        doc.category = req.body.category ? req.body.category : doc.category;
        doc.productImage = req.file ? req.file.path : "";
        try {
            const updatedDoc = await doc.save();
            res.json({
                updatedDoc,
                message: "Product Updated Successfully",
                statusCode: 200,
            });
        } catch (err) {
            res.json({ messag: err.message });
        }
    }
);

router.delete("/:id", authenticateToken, getProduct, async (req, res) => {
    try {
        await res.product.remove();
        res.json({ message: "Deleted product" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

async function getProduct(req, res, next) {
    let product;
    try {
        product = await Products.findById(req.params.id);
        if (product == null) {
            return res.status(404).json({ message: "Cannot find product" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.product = product;
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
