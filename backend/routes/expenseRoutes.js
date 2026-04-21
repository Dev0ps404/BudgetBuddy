const express = require("express");
const router = express.Router();
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetStats,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getExpenses).post(protect, addExpense);

// Budget stats endpoint - for alert feature
router.get("/budget-stats", protect, getBudgetStats);

router.route("/:id").put(protect, updateExpense).delete(protect, deleteExpense);

module.exports = router;
