const express = require("express");
const multer = require("multer");

const Blogs = require("../models/blog");

const router = express.Router();

const { authenticateToken } = require("./authentication");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/blogs/");
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
        cb(null, `blog-${Date.now().toString()}.${extension}`);
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

router.get("/", paginatedResults(Blogs), async (req, res) => {
    try {
        res.json(res.paginatedResults);
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const blog = await Blogs.findOne({ _id: req.params.id });
        res.json({ results: blog });
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.post("/", upload.single("blogImage"), async (req, res) => {
    const blog = new Blogs({
        author: req.body.author,
        title: req.body.title,
        blogImage: req.file.path,
        body: req.body.body,
    });

    try {
        const blogToSave = await blog.save();
        res.status(201).json(blogToSave);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch(
    "/:id",
    authenticateToken,
    upload.single("blogImage"),
    async (req, res) => {
        const doc = await Blogs.findOne({ _id: req.params.id });
        doc.author = req.body.author ? req.body.author : doc.author;
        doc.title = req.body.title ? req.body.title : doc.title;
        doc.body = req.body.body ? req.body.body : doc.body;
        doc.blogImage = req.file ? req.file.path : "";
        const updatedDoc = await doc.save();
        res.json({
            updatedDoc,
            message: "Blog Updated Successfully",
            statusCode: 200,
        });
    }
);

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        await Blogs.deleteOne({ _id: req.params.id });
        res.json({ message: "Deleted Blog", statusCode: 200 });
    } catch (err) {
        res.status(500).json({ message: err.message, statusCode: 500 });
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
