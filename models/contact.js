const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "Name",
    },
    phoneNumber: {
        type: String,
        required: false,
        default: "984445738",
    },
    email: {
        type: String,
        required: false,
        default: "someone@noone.com",
    },
    message: {
        type: String,
        required: false,
        default:
            "somewhere along the way i found a meaning woke up dreaming along the way",
    },
});

module.exports = mongoose.model("Contact", contactSchema);
