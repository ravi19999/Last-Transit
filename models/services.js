const mongoose = require("mongoose");

const servicesSchema = mongoose.Schema({
    serviceName: { type: String, default:"Helloo" },
    category: {
        type: String,
        default: "category",
    },
    details: {
        type: String,
        required: true,
        default: "details",
    },
    created: {
        type: Date,
        default: new Date(),
    },
});

module.exports = mongoose.model("Services", servicesSchema);
