const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const {
  addFinancialRecord,
  getAllFinancialRecords,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialSummary,
  getCategorySummary,
  getMonthlyTrends,
} = require("../controllers/record.controller");

// Static routes first
router.get("/summary", authMiddleware, authorize("analyst", "admin"), getFinancialSummary);
router.get("/categories", authMiddleware, authorize("analyst", "admin"), getCategorySummary);
router.get("/trends", authMiddleware, authorize("analyst", "admin"), getMonthlyTrends);
// General routes
router.get("/", authMiddleware, authorize("viewer", "analyst", "admin"), getAllFinancialRecords);
router.post("/", authMiddleware, authorize("admin"), addFinancialRecord);

// Dynamic routes last
router.put("/:id", authMiddleware, authorize("admin"), updateFinancialRecord);
router.delete("/:id", authMiddleware, authorize("admin"), deleteFinancialRecord);

module.exports = router;