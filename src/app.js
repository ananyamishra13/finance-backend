const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes"); // 👈 ADD THIS

const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});


app.use("/api/auth", authRoutes);

// 404 handler 
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;