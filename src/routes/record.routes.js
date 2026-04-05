const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  addFinancialRecord,
  getAllFinancialRecords,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialSummary,
  getCategorySummary,
} = require("../controllers/record.controller");

// ✅ Static routes FIRST (before /:id)
router.get("/summary",    authMiddleware, getFinancialSummary);
router.get("/categories", authMiddleware, getCategorySummary);

// ✅ General routes
router.get("/",    authMiddleware, getAllFinancialRecords);
router.post("/",   authMiddleware, addFinancialRecord);

// ✅ Dynamic routes LAST
router.put("/:id",    authMiddleware, updateFinancialRecord);
router.delete("/:id", authMiddleware, deleteFinancialRecord);

module.exports = router;