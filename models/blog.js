const mongoose = require("mongoose");
let month = new Date().getMonth();
let day = new Date().getDate();
let year = new Date().getFullYear();
let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
let date = `${months[month]}-${day}-${year}`;

const blogSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    blogImage: {
        type: String,
        default: " ",
    },
    created: {
        type: String,
        default: date,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

module.exports = mongoose.model("Blogs", blogSchema);
