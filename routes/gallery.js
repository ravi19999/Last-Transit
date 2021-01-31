const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();

const Products = require("../models/products");
// const Services = require("../models/services");
const Partners = require("../models/partners");
const team = require("../models/team");

router.get("/", async (req, res) => {
    const products = await Products.find()
        .sort("created")
        .limit(2)
        .select("productImage");
    const partners = await Partners.find()
        .sort("created")
        .limit(2)
        .select("logo");

    const productImages = products.map((product) => product.productImage);
    const partnerImages = partners.map((partner) => partner.logo);
    const combinedImages = [...productImages, ...partnerImages];
    const combinedImagesObject = combinedImages.map((image) => {
        return {
            picture: image,
        };
    });

    try {
        res.json({ results: combinedImagesObject });
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.get("/more", async (req, res) => {
    const products = await Products.find()
        .sort("created")
        .limit(10)
        .select("productImage");
    const partners = await Partners.find()
        .sort("created")
        .limit(10)
        .select("logo");

    const productImages = products.map((product) => product.productImage);
    const partnerImages = partners.map((partner) => partner.logo);
    const combinedImages = [...productImages, ...partnerImages];
    const combinedImagesObject = combinedImages.map((image) => {
        return {
            picture: image,
        };
    });

    try {
        res.json({ results: combinedImagesObject });
    } catch (err) {
        res.json({ message: err.message });
    }
});

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 4;

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
