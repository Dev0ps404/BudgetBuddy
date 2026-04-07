const express = require("express");
const router = express.Router();
const {
  chatWithAI,
  getInsights,
  getRecommendations,
  predictSpending,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

/**
 * AI Routes
 * All routes are protected (require authentication)
 */

// POST /api/ai/chat - Chat with AI assistant
router.post("/chat", protect, chatWithAI);

// GET /api/ai/insights - Get AI-generated insights
router.get("/insights", protect, getInsights);

// GET /api/ai/recommendations - Get spending recommendations
router.get("/recommendations", protect, getRecommendations);

// GET /api/ai/predict - Get spending prediction
router.get("/predict", protect, predictSpending);

module.exports = router;
