const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        default: "New Product",
    },
    category: {
        type: String,
        required: true,
        default: "New Category",
    },
    details: {
        type: String,
        required: true,
        default: "Details",
    },
    productImage: { type: String, required: false, default: "" },
    created: {
        type: Date,
        default: new Date(),
    },
});

module.exports = mongoose.model("Products", productsSchema);
