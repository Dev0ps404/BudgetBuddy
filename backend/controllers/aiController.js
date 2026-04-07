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
    console.log("User ID:", req.user.id);

    // Fetch user's expenses
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });

    console.log("Expenses found:", expenses.length);

    // Get AI response
    const reply = await aiService.generateChatResponse(
      message,
      expenses,
      req.user,
    );

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
 * @access  Private
 */
const getInsights = async (req, res) => {
  try {
    // Fetch user's expenses
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });

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
 * @access  Private
 */
const getRecommendations = async (req, res) => {
  try {
    // Fetch user's expenses
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });

    // Get user for budget
    const User = require("../models/User");
    const user = await User.findById(req.user.id);

    // Generate recommendations
    const recommendations = aiService.generateRecommendations(
      expenses,
      user?.monthlyBudget,
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
 * @access  Private
 */
const predictSpending = async (req, res) => {
  try {
    // Fetch user's expenses
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });

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
