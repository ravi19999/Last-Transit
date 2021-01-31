const mongoose = require("mongoose");

const partnersSchema = new mongoose.Schema({
    partnerName: {
        type: String,
        required: true,
        default: "Naya Partner",
    },
    logo: {
        type: String,
        default: "",
    },
    details: {
        type: String,
        default: "",
    },
    facebook: {
        type: String,
        required: false,
        default: "facebook.com",
    },
    twitter: {
        type: String,
        required: false,
        default: "twitter.com",
    },
    linkedin: {
        type: String,
        required: false,
        default: "linkedin.com",
    },
    created: {
        type: Date,
        required: false,
        default: new Date(),
    },
    address: {
        type: String,
        default: "",
    },
});
module.exports = mongoose.model("Partners", partnersSchema);
