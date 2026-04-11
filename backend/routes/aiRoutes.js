const express = require("express");
const router = express.Router();
const {
  chatWithAI,
  getInsights,
  getRecommendations,
  predictSpending,
} = require("../controllers/aiController");

/**
 * AI Routes
 * No authentication required - AI features are available to all users
 */

// POST /api/ai/chat - Chat with AI assistant
router.post("/chat", chatWithAI);

// GET /api/ai/insights - Get AI-generated insights
router.get("/insights", getInsights);

// GET /api/ai/recommendations - Get spending recommendations
router.get("/recommendations", getRecommendations);

// GET /api/ai/predict - Get spending prediction
router.get("/predict", predictSpending);

module.exports = router;
