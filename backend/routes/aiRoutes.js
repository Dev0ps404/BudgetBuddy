const express = require("express");
const router = express.Router();
const {
  chatWithAI,
  queryAIWithDatabase,
  getInsights,
  getRecommendations,
  predictSpending,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

/**
 * AI Routes
 */

// POST /api/ai/query - Ask AI with role-scoped database context
router.post("/query", protect, queryAIWithDatabase);

// POST /api/ai/chat - Chat with AI assistant
router.post("/chat", chatWithAI);

// GET /api/ai/insights - Get AI-generated insights
router.get("/insights", getInsights);

// GET /api/ai/recommendations - Get spending recommendations
router.get("/recommendations", getRecommendations);

// GET /api/ai/predict - Get spending prediction
router.get("/predict", predictSpending);

module.exports = router;
