const Expense = require("../models/Expense");
const User = require("../models/User");

// @desc    Get all expenses for a user
// @route   GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
const addExpense = async (req, res) => {
  const { amount, category, description, date } = req.body;

  try {
    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      description,
      date: date || Date.now(),
    });
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check for user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check for user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await expense.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get budget stats for current month (for alert)
// @route   GET /api/expenses/budget-stats
const getBudgetStats = async (req, res) => {
  try {
    // Get user's monthly budget
    const user = await User.findById(req.user.id);
    const monthlyBudget = user?.monthlyBudget || 1000;

    // Get current month's expenses
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const monthlyExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalExpenses = monthlyExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    // Calculate percentage
    const percentageUsed =
      monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

    res.json({
      monthlyBudget,
      totalExpenses,
      percentageUsed: Math.round(percentageUsed),
      status:
        percentageUsed >= 80
          ? "critical"
          : percentageUsed >= 50
            ? "warning"
            : "safe",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetStats,
};
