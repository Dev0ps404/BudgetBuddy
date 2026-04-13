const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const User = require("../models/User");
const aiService = require("../services/aiService");

const DEFAULT_LOOKBACK_DAYS = 30;
const MAX_LOOKBACK_DAYS = 90;
const MAX_CONTEXT_TRANSACTIONS = 50;

const clampLookbackDays = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_LOOKBACK_DAYS;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), MAX_LOOKBACK_DAYS);
};

const toCurrencyNumber = (value) => Number(Number(value || 0).toFixed(2));

/**
 * @desc    Chat with AI assistant about expenses
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    console.log("Chat request received:", message);

    let expenses = [];
    let user = null;

    // If user is authenticated, fetch their expenses
    if (req.user && req.user.id) {
      console.log("User ID:", req.user.id);
      expenses = await Expense.find({ user: req.user.id }).sort({
        date: -1,
      });
      user = req.user;
      console.log("Expenses found:", expenses.length);
    } else {
      console.log("Unauthenticated user - using demo mode");
    }

    // Get AI response
    const reply = await aiService.generateChatResponse(message, expenses, user);

    console.log("AI Response:", reply);
    res.json({ reply });
  } catch (error) {
    console.error("Chat Error - Full Details:", {
      message: error.message,
      stack: error.stack,
      error: error,
    });
    res.status(500).json({
      message: "Error processing chat",
      error: error.message,
    });
  }
};

/**
 * @desc    Query AI with real MongoDB data context
 * @route   POST /api/ai/query
 * @access  Private
 */
const queryAIWithDatabase = async (req, res) => {
  try {
    const rawQuery = req.body?.query ?? req.body?.message;
    const userQuery = typeof rawQuery === "string" ? rawQuery.trim() : "";

    if (!userQuery) {
      return res.status(400).json({ message: "Query cannot be empty" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const isAdmin = req.user?.role === "admin";
    const requestedUserId = req.body?.userId;
    const targetUserId =
      isAdmin && requestedUserId ? requestedUserId : req.user.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const lookbackDays = clampLookbackDays(req.body?.lookbackDays);
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - lookbackDays);

    const mongoUserId = new mongoose.Types.ObjectId(targetUserId);

    const [userDoc, recentExpenses, aggregateResult] = await Promise.all([
      User.findById(targetUserId).select("username monthlyBudget").lean(),
      Expense.find({
        user: targetUserId,
        date: { $gte: startDate, $lte: endDate },
      })
        .sort({ date: -1 })
        .limit(MAX_CONTEXT_TRANSACTIONS)
        .select("amount category description date")
        .lean(),
      Expense.aggregate([
        {
          $match: {
            user: mongoUserId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  totalTransactions: { $sum: 1 },
                  totalSpent: { $sum: "$amount" },
                  averageTransaction: { $avg: "$amount" },
                  maxTransaction: { $max: "$amount" },
                  minTransaction: { $min: "$amount" },
                  latestTransactionAt: { $max: "$date" },
                },
              },
            ],
            byCategory: [
              {
                $group: {
                  _id: "$category",
                  totalSpent: { $sum: "$amount" },
                  count: { $sum: 1 },
                },
              },
              { $sort: { totalSpent: -1 } },
              { $limit: 10 },
            ],
          },
        },
      ]),
    ]);

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const aggregate = aggregateResult[0] || { totals: [], byCategory: [] };
    const totals = aggregate.totals[0] || {
      totalTransactions: 0,
      totalSpent: 0,
      averageTransaction: 0,
      maxTransaction: 0,
      minTransaction: 0,
      latestTransactionAt: null,
    };

    const monthlyBudget = Number(userDoc.monthlyBudget || 0);
    const totalSpent = toCurrencyNumber(totals.totalSpent);
    const budgetUsagePct =
      monthlyBudget > 0
        ? Number(((totalSpent / monthlyBudget) * 100).toFixed(2))
        : null;

    const contextData = {
      generatedAt: new Date().toISOString(),
      dataWindow: {
        days: lookbackDays,
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      user: {
        id: String(userDoc._id),
        name: userDoc.username || "User",
        monthlyBudget: toCurrencyNumber(monthlyBudget),
      },
      expenses: {
        summary: {
          totalTransactions: totals.totalTransactions || 0,
          totalSpent,
          averageTransaction: toCurrencyNumber(totals.averageTransaction),
          maxTransaction: toCurrencyNumber(totals.maxTransaction),
          minTransaction: toCurrencyNumber(totals.minTransaction),
          latestTransactionAt: totals.latestTransactionAt
            ? new Date(totals.latestTransactionAt).toISOString()
            : null,
          budgetUsagePct,
        },
        byCategory: aggregate.byCategory.map((item) => ({
          category: item._id,
          totalSpent: toCurrencyNumber(item.totalSpent),
          count: item.count,
        })),
        recentTransactions: recentExpenses.map((item) => ({
          amount: toCurrencyNumber(item.amount),
          category: item.category,
          description: item.description
            ? String(item.description).slice(0, 120)
            : "",
          date: new Date(item.date).toISOString(),
        })),
      },
    };

    const aiResult = await aiService.generateDatabaseQueryResponse(
      userQuery,
      contextData,
      { userId: String(userDoc._id) },
    );

    return res.json({
      reply: aiResult.reply,
      meta: {
        cached: aiResult.cached,
        lookbackDays,
        totalTransactions: contextData.expenses.summary.totalTransactions,
        transactionsInPrompt: contextData.expenses.recentTransactions.length,
      },
    });
  } catch (error) {
    console.error("AI Query Error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: "Error processing AI query" });
  }
};

/**
 * @desc    Get AI-generated expense insights
 * @route   GET /api/ai/insights
 * @access  Public
 */
const getInsights = async (req, res) => {
  try {
    let expenses = [];

    // If user is authenticated, fetch their expenses
    if (req.user && req.user.id) {
      expenses = await Expense.find({ user: req.user.id }).sort({
        date: -1,
      });
    }

    // Generate insights
    const insights = aiService.generateInsights(expenses);

    res.json(insights);
  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ message: "Error generating insights" });
  }
};

/**
 * @desc    Get spending recommendations
 * @route   GET /api/ai/recommendations
 * @access  Public
 */
const getRecommendations = async (req, res) => {
  try {
    let expenses = [];
    let monthlyBudget = null;

    // If user is authenticated, fetch their expenses and budget
    if (req.user && req.user.id) {
      expenses = await Expense.find({ user: req.user.id }).sort({
        date: -1,
      });

      // Get user for budget
      const User = require("../models/User");
      const user = await User.findById(req.user.id);
      monthlyBudget = user?.monthlyBudget;
    }

    // Generate recommendations
    const recommendations = aiService.generateRecommendations(
      expenses,
      monthlyBudget,
    );

    res.json({ recommendations });
  } catch (error) {
    console.error("Recommendations Error:", error);
    res.status(500).json({ message: "Error generating recommendations" });
  }
};

/**
 * @desc    Predict end-of-month spending
 * @route   GET /api/ai/predict
 * @access  Public
 */
const predictSpending = async (req, res) => {
  try {
    let expenses = [];

    // If user is authenticated, fetch their expenses
    if (req.user && req.user.id) {
      expenses = await Expense.find({ user: req.user.id }).sort({
        date: -1,
      });
    }

    // Generate prediction
    const prediction = aiService.predictMonthlySpending(expenses);

    res.json(prediction);
  } catch (error) {
    console.error("Prediction Error:", error);
    res.status(500).json({ message: "Error generating prediction" });
  }
};

module.exports = {
  chatWithAI,
  queryAIWithDatabase,
  getInsights,
  getRecommendations,
  predictSpending,
};
