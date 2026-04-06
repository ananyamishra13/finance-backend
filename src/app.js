const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const recordRoutes = require("./routes/record.routes"); // 👈 MOVE HERE

const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes); 
app.use("/api/users", userRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;