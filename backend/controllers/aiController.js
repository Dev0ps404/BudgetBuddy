const Expense = require("../models/Expense");
const aiService = require("../services/aiService");

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
  getInsights,
  getRecommendations,
  predictSpending,
};
