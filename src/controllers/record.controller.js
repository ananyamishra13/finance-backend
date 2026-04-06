const mongoose = require("mongoose");
const FinancialRecord = require("../models/record.model");

// ================= CREATE =================
const addFinancialRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const record = await FinancialRecord.create({
      amount,
      type,
      category,
      date,
      notes,
      user: req.user._id, // ✅ JWT user
    });

    res.status(201).json({
      success: true,
      message: "Record created",
      data: record,
    });

  } catch (error) {
    console.error("Create error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL + FILTER =================
const getAllFinancialRecords = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query;

    const query = { user: req.user._id };

    // filtering
    if (type) query.type = type;
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // pagination
    const pageNumber = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageLimit;

    const totalRecords = await FinancialRecord.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / pageLimit);

    const records = await FinancialRecord.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      count: records.length,
      totalRecords,
      totalPages,
      currentPage: pageNumber,
      data: records,
    });

  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE =================
const updateFinancialRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    const record = await FinancialRecord.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (amount !== undefined) record.amount = amount;
    if (type !== undefined) record.type = type;
    if (category !== undefined) record.category = category;
    if (date !== undefined) record.date = date;
    if (notes !== undefined) record.notes = notes;

    const updatedRecord = await record.save();

    res.status(200).json({
      success: true,
      message: "Record updated",
      data: updatedRecord,
    });

  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE =================
const deleteFinancialRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await FinancialRecord.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
    });

  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= SUMMARY =================
const getFinancialSummary = async (req, res) => {
  try {
    const summary = await FinancialRecord.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totals = { income: 0, expense: 0 };

    summary.forEach(({ _id, total }) => {
      totals[_id] = total;
    });

    const netBalance = totals.income - totals.expense;

    res.status(200).json({
      success: true,
      data: {
        totalIncome: totals.income,
        totalExpense: totals.expense,
        netBalance,
        status: netBalance >= 0 ? "surplus" : "deficit",
      },
    });

  } catch (error) {
    console.error("Summary error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= CATEGORY =================
const getCategorySummary = async (req, res) => {
  try {
    const categorySummary = await FinancialRecord.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          type: "$_id.type",
          total: 1,
        },
      },
    ]);

    const income = categorySummary.filter((i) => i.type === "income");
    const expense = categorySummary.filter((i) => i.type === "expense");

    res.status(200).json({
      success: true,
      data: { income, expense },
    });

  } catch (error) {
    console.error("Category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
const getMonthlyTrends = async (req, res) => {
  try {
    const trends = await FinancialRecord.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addFinancialRecord,
  getAllFinancialRecords,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialSummary,
  getCategorySummary,
  getMonthlyTrends,
};