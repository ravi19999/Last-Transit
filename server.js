const express = require("express");
const app = express();
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const bodyParser = require("body-parser");
var cors = require("cors");
// const Product = require("./models/products");
// const Blogs = require("./models/blogs");
let faker = require("faker");

// var corsOptions = {
//     origin: "http://localhost:3000",
//     optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Data Transit API",
            description: "Data Transit API Information",
            contact: {
                number: "+XXX-XXXXX",
            },
            servers: ["http://localhost:3000"],
        },
    },
    apis: ["./routes/products.js", ".routes/services.js"],
};

// const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());

mongoose.connect("mongodb://localhost/tasks", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
// db.once("open", () => console.log("Connected to database"));
db.once("open", () => console.log("Connected to database()"));

app.get("/", (req, res) => {
    res.send("Helloo");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(upload.array());

app.use(express.json());
app.use("/uploads", express.static("uploads"));

const productsRouter = require("./routes/products");
app.use("/products", productsRouter);

const servicesRouter = require("./routes/services");
app.use("/services", servicesRouter);

const blogRouter = require("./routes/blog");
app.use("/blogs", blogRouter);

const offersRouter = require("./routes/offers");
app.use("/offers", offersRouter);

const teamsRouter = require("./routes/team");
app.use("/teams", teamsRouter);

const partnersRouter = require("./routes/partners");
app.use("/partners", partnersRouter);

const galleryRouter = require("./routes/gallery");
app.use("/gallery", galleryRouter);

const contactRouter = require("./routes/contact");
app.use("/contact", contactRouter);

const { authRouter } = require("./routes/authentication");
app.use("/auth", authRouter);

app.listen(3000, () => {
    console.log("Congratulations");
});
