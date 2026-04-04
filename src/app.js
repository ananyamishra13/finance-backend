const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

module.exports = app;   