const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "",
    },
    position: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
});

module.exports = mongoose.model("Teams", teamSchema);
