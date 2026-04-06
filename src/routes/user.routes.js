const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/user.controller");

// Admin only
router.get("/", authMiddleware, authorize("admin"), getAllUsers);
router.patch("/:id/role", authMiddleware, authorize("admin"), updateUserRole);
router.patch("/:id/status", authMiddleware, authorize("admin"), updateUserStatus);

module.exports = router;