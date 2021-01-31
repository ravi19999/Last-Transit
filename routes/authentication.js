require("dotenv").config();

const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/auth");

// authRouter.post("/signup", async (req, res) => {
//     console.log(req.body);
//     const userExists = await User.findOne({ email: req.body.email });

//     if (userExists) {
//         res.status(400).json({ message: "User already exists" });
//     }

//     const user = new User({
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password,
//         refreshToken: "",
//     });
//     const newUser = await user.save();

//     if (newUser) {
//         res.status(201).json({
//             _id: newUser._id,
//             name: newUser.name,
//             email: newUser.email,
//             token: generateToken(user._id),
//         });
//     } else {
//         res.status(400);
//         throw new Error("Invalid user data");
//     }
// });

// authRouter.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     const user = User.findOne({ email });

//     if (user && (await User.matchPassword(password))) {
//         res.json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             token: generateToken(user._id),
//         });
//     } else {
//         res.status(401).json({ message: "Couldn't authenticate user" });
//     }
// });

authRouter.post("/signin", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const user = { name: username, password, email };
    const newUser = new User({
        name: username,
        password: password,
        email: email,
        accessToken: generateToken(email),
    });
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
});

// const authMiddleware = async (req, res, next) => {
//     let token;
//     if (
//         req.headers.authorization &&
//         req.headers.authorization.startsWith("Bearer")
//     ) {
//         try {
//             token = req.headers.authorization.split(" ")[1];
//             const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//             req.user = await User.findById(decoded.id).select("-password");
//             next();
//         } catch (err) {
//             res.status(401).json({ err: err.message });
//         }
//     }
//     if (!token) {
//         res.status(401).json({ message: "Unauthorized" });
//     }
//     next();
// };

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET);
};

module.exports = {
    authRouter,
    authenticateToken,
};
