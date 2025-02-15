require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection
mongoose.connect(process.env.DB_URI)
    .then(() => console.log("Database connected"))
    .catch((error) => console.log("Database connection error:", error));

// Middleware for session
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static("uploads"));

//set template

app.set("view engine", "ejs");

//router prefix

app.use("/", require("./routes/routes.js"));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
