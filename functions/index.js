const functions = require("firebase-functions");
const express = require("express");
const app = express();

// Set up the view engine to use Pug
app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

// Define routes
app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

// Export the Express app as an HTTP function
exports.app = functions.https.onRequest(app);
