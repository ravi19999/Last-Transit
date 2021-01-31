const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");

router.get("/", async (req, res) => {
    let contacts = await Contact.find();
    try {
        res.json({ results: contacts });
    } catch (err) {
        res.json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    let contact = await Contact.findById(req.params.id);
    res.json({ results: contact });
});

router.post("/", async (req, res) => {
    console.log(req.body);
    const contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        message: req.body.message,
    });
    try {
        const newContact = await contact.save();
        res.status(201).json(newContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
