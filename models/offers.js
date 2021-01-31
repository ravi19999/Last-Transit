const mongoose = require("mongoose");

const offersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "",
    },
    details: {
        type: String,
        required: false,
    },
    created: {
        type: Date,
        required: false,
        default: new Date(),
    },
});

module.exports = mongoose.model("Offers", offersSchema);
