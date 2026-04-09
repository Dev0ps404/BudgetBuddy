const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Service Module for Financial Assistant
 * Provides intelligent insights, predictions, and chat responses
 */

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.client = null;
    this.model = null;

    if (this.apiKey) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
        this.model = this.client.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
        console.log("✅ Gemini AI Model initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize Gemini model:", error.message);
      }
    } else {
      console.warn("⚠️ GEMINI_API_KEY not found in environment variables");
    }
  }

  /**
   * Generate AI response for any user question - like ChatGPT
   * Can answer general questions OR provide expense insights
   * @param {string} question - User's question
   * @param {Array} expenses - User's expense data
   * @param {Object} user - User object
   * @returns {Promise<string>} - AI response
   */
  async generateChatResponse(question, expenses, user) {
    try {
      if (!this.apiKey) {
        console.error("GEMINI_API_KEY not found in environment");
        return "ExpenseIQ is not configured. Please add GEMINI_API_KEY to environment variables.";
      }

      if (!this.model) {
        console.error("Model not initialized. Creating new client...");
        this.client = new GoogleGenerativeAI(this.apiKey);
        this.model = this.client.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
      }

      // Check if question is expense-related
      const isExpenseRelated = this.isExpenseQuestion(question);
      let expenseContext = "";

      if (isExpenseRelated) {
        expenseContext = `\n\nUser's Financial Context:
User's name: ${user?.name || "Friend"}
User's monthly budget: ₹${user?.monthlyBudget || "Not set"}
${this.generateExpenseSummary(expenses)}`;
      }

      // Create an advanced system prompt like ChatGPT
      const systemPrompt = `You are ExpenseIQ, an advanced AI assistant with expertise in:
1. Personal Finance & Expense Management (your specialty)
2. General knowledge across various topics
3. Problem-solving and advice

Your personality:
- Smart, helpful, and conversational
- Provides practical, actionable advice
- Uses data when available (especially for finance)
- Keeps responses concise (1-3 sentences usually, max 5 for complex topics)
- Friendly and professional tone
- Uses emoji occasionally to add warmth
${expenseContext}

General Guidelines:
- Answer ANY question the user asks (general knowledge, advice, explanations, etc.)
- If they ask about expenses, use their actual data to personalize answers
- For finance questions: use ₹ for Indian Rupees
- Be honest about limitations
- Keep responses helpful and focused

User question: ${question}`;

      console.log("Calling Gemini API...");
      const result = await this.model.generateContent(systemPrompt);

      if (!result || !result.response) {
        console.error("Invalid response from Gemini API");
        return this.generateLocalResponse(question, expenses, user);
      }

      const aiText = result.response.text();

      if (!aiText) {
        console.error("Empty response text from Gemini");
        return this.generateLocalResponse(question, expenses, user);
      }

      console.log("✅ AI Response generated successfully");
      return aiText;
    } catch (error) {
      console.error("❌ AI Service Error:", {
        message: error.message,
        code: error.code,
      });
      return this.generateLocalResponse(question, expenses, user);
    }
  }

  /**
   * Detect if the question is expense/finance related
   * @param {string} question - User's question
   * @returns {boolean} - True if expense-related
   */
  isExpenseQuestion(question) {
    const expenseKeywords = [
      "spend",
      "expense",
      "budget",
      "cost",
      "money",
      "rupee",
      "₹",
      "save",
      "expense",
      "category",
      "spent",
      "total",
      "monthly",
      "daily",
      "financial",
      "income",
      "spending",
      "transaction",
      "purchase",
    ];
    const lowerQ = question.toLowerCase();
    return expenseKeywords.some((kw) => lowerQ.includes(kw));
  }

  /**
   * Generate response using local data analysis (fallback when API fails)
   * Handles both expense questions and general questions
   * @param {string} question - User's question
   * @param {Array} expenses - User's expense data
   * @param {Object} user - User object
   * @returns {string} - Response based on local analysis or helpful fallback
   */
  generateLocalResponse(question, expenses, user) {
    console.log("⚡ Using fallback local response generation...");

    const isExpenseQ = this.isExpenseQuestion(question);
    const lowerQ = question.toLowerCase();

    // For general questions, provide helpful fallback
    if (!isExpenseQ) {
      const responses = {
        hello:
          "👋 Hi there! I'm ExpenseIQ. While I'm great at analyzing expenses, I can also help with general questions. What would you like to know?",
        hi: "👋 Hey! Ready to manage your finances? Ask me anything about your expenses or any other topic!",
        help: "📚 I can help you with: \n• Expense analysis & budgeting\n• Spending insights & predictions\n• Financial tips & recommendations\n• Or any general question you have!",
        thanks: "😊 You're welcome! Need help with anything else?",
        how: "🤔 I'm here to help! Feel free to ask me about your expenses or anything else on your mind.",
        what: "❓ You can ask me about your spending habits, budget analysis, financial tips, or pretty much anything!",
      };

      // Find matching response
      for (const [keyword, response] of Object.entries(responses)) {
        if (lowerQ.includes(keyword)) {
          return response;
        }
      }

      // Default response for general questions
      return `🤖 That's an interesting question! While I'm specialized in expense management, I can try to help. For more detailed answers, I work best with the AI API. What else would you like to know about your finances? 💰`;
    }

    // For expense-related questions, use expense data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = expenses.filter((e) => {
      const expDate = new Date(e.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    if (monthExpenses.length === 0) {
      return "📭 No expenses recorded yet this month. Start tracking to get personalized insights!";
    }

    const totalMonthly = monthExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const categoryBreakdown = {};
    monthExpenses.forEach((e) => {
      categoryBreakdown[e.category] =
        (categoryBreakdown[e.category] || 0) + Number(e.amount);
    });

    const sortedCategories = Object.entries(categoryBreakdown).sort(
      (a, b) => b[1] - a[1],
    );

    const questionLower = question.toLowerCase();

    // Handle common questions
    if (
      questionLower.includes("where") ||
      questionLower.includes("most") ||
      questionLower.includes("spend") ||
      questionLower.includes("highest")
    ) {
      const topCategory = sortedCategories[0];
      const percentage = ((topCategory[1] / totalMonthly) * 100).toFixed(0);
      return `Your highest spending is on ${topCategory[0]}: ₹${topCategory[1].toFixed(0)} (${percentage}% of total). Total this month: ₹${totalMonthly.toFixed(0)}.`;
    }

    if (
      questionLower.includes("total") ||
      questionLower.includes("spent") ||
      questionLower.includes("budget")
    ) {
      return `You've spent ₹${totalMonthly.toFixed(0)} this month across ${sortedCategories.length} categories. Remaining budget: ₹${(user.monthlyBudget - totalMonthly).toFixed(0)}.`;
    }

    if (
      questionLower.includes("category") ||
      questionLower.includes("breakdown")
    ) {
      const breakdown = sortedCategories
        .map((c) => `${c[0]}: ₹${c[1].toFixed(0)}`)
        .join(", ");
      return `Here's your spending by category: ${breakdown}`;
    }

    if (
      questionLower.includes("save") ||
      questionLower.includes("reduce") ||
      questionLower.includes("cut")
    ) {
      const topCategory = sortedCategories[0];
      return `To save money, focus on reducing ${topCategory[0]} spending, which is your highest expense at ₹${topCategory[1].toFixed(0)}.`;
    }

    // Default response
    return `You've spent ₹${totalMonthly.toFixed(0)} this month. Your top spending category is ${sortedCategories[0][0]} (₹${sortedCategories[0][1].toFixed(0)}).`;
  }

  /**
   * Generate structured insights from expense data
   * @param {Array} expenses - User's expense data
   * @returns {Object} - Structured insights
   */
  generateInsights(expenses) {
    if (!expenses || expenses.length === 0) {
      return {
        status: "no_data",
        message: "No expenses to analyze yet",
        insights: [],
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter expenses for current month
    const monthExpenses = expenses.filter((e) => {
      const expDate = new Date(e.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    if (monthExpenses.length === 0) {
      return {
        status: "no_month_data",
        message: "No expenses this month",
        insights: [],
      };
    }

    // Calculate metrics
    const totalMonthly = monthExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    // Category breakdown
    const categoryBreakdown = {};
    monthExpenses.forEach((e) => {
      categoryBreakdown[e.category] =
        (categoryBreakdown[e.category] || 0) + Number(e.amount);
    });

    // Sort categories by amount
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3); // Top 3

    // Weekly data
    const weekExpenses = expenses.filter((e) => {
      const expDate = new Date(e.date);
      const daysDiff = Math.floor((now - expDate) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });

    const weekTotal = weekExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    // Identify high spend day
    const daySpend = {};
    monthExpenses.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString();
      daySpend[day] = (daySpend[day] || 0) + Number(e.amount);
    });

    const highestDay = Object.entries(daySpend).sort((a, b) => b[1] - a[1])[0];

    // Build insights
    const insights = [];

    insights.push({
      type: "total_monthly",
      title: "Monthly Total",
      value: `₹${totalMonthly.toFixed(0)}`,
      description: `You've spent ₹${totalMonthly.toFixed(0)} this month`,
      icon: "💰",
    });

    insights.push({
      type: "weekly_average",
      title: "Weekly Pace",
      value: `₹${weekTotal.toFixed(0)}`,
      description: `Last 7 days: ₹${weekTotal.toFixed(0)}`,
      icon: "📊",
    });

    if (sortedCategories.length > 0) {
      insights.push({
        type: "top_category",
        title: "Top Spending",
        value: `${sortedCategories[0][0]}`,
        description: `${((sortedCategories[0][1] / totalMonthly) * 100).toFixed(0)}% of your budget`,
        icon: "🎯",
      });
    }

    if (highestDay) {
      insights.push({
        type: "highest_day",
        title: "Highest Spend Day",
        value: `₹${highestDay[1].toFixed(0)}`,
        description: `On ${highestDay[0]}`,
        icon: "📈",
      });
    }

    return {
      status: "success",
      totalMonthly,
      weekTotal,
      categoryBreakdown,
      insights,
      averageDaily: (totalMonthly / now.getDate()).toFixed(0),
    };
  }

  /**
   * Generate spending recommendations
   * @param {Array} expenses - User's expense data
   * @param {number} budget - User's monthly budget
   * @returns {Array} - Recommendations
   */
  generateRecommendations(expenses, budget) {
    const recommendations = [];

    if (!expenses || expenses.length === 0) {
      recommendations.push({
        type: "get_started",
        title: "🚀 Get Started",
        description:
          "Start tracking expenses to get personalized recommendations",
      });
      return recommendations;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = expenses.filter((e) => {
      const expDate = new Date(e.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    if (monthExpenses.length === 0) {
      return recommendations;
    }

    const totalMonthly = monthExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysElapsed = now.getDate();
    const dailyAverage = totalMonthly / Math.max(daysElapsed, 1);

    // Calculate category percentages
    const categoryTotals = {};
    const categoryCounts = {};
    monthExpenses.forEach((e) => {
      categoryTotals[e.category] =
        (categoryTotals[e.category] || 0) + Number(e.amount);
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    );

    const existingTitles = new Set();
    const addRecommendation = (item) => {
      if (!item?.title || existingTitles.has(item.title)) return;
      existingTitles.add(item.title);
      recommendations.push(item);
    };

    // Find high-spend categories
    sortedCategories.forEach(([category, amount]) => {
      const percentage = (amount / totalMonthly) * 100;
      if (percentage > 40) {
        addRecommendation({
          type: "high_spend",
          title: `📍 ${category} Alert`,
          description: `${percentage.toFixed(0)}% of spending goes to ${category}. Consider optimizing.`,
          category,
          percentage,
        });
      }
    });

    // Category concentration advice
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const topShare = (topAmount / totalMonthly) * 100;
      const topTxnCount = categoryCounts[topCategory] || 0;

      if (topShare >= 60) {
        addRecommendation({
          type: "projection",
          title: "🎯 Category Mix Tip",
          description: `${topCategory} is ${topShare.toFixed(0)}% of your monthly spend. Set a soft cap near ₹${(topAmount * 0.85).toFixed(0)} next month.`,
        });
      }

      if (topTxnCount >= 5) {
        addRecommendation({
          type: "on_track",
          title: "🔁 Repeat Spend Notice",
          description: `${topCategory} had ${topTxnCount} transactions this month. Planning these purchases weekly can reduce impulse spends.`,
        });
      }
    }

    // Budget warning
    if (budget && totalMonthly > budget * 0.8) {
      const remaining = budget - totalMonthly;
      addRecommendation({
        type: "budget_warning",
        title: "⚠️ Budget Alert",
        description: `Only ₹${remaining.toFixed(0)} left in your ₹${budget} budget`,
      });
    }

    // Savings opportunity
    const projectedMonthly = dailyAverage * daysInMonth;
    if (budget && projectedMonthly > budget) {
      addRecommendation({
        type: "projection",
        title: "📊 Trend Alert",
        description: `At current pace, you'll spend ₹${projectedMonthly.toFixed(0)} by month end`,
      });
    }

    // Weekly trend comparison
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const last7Start = new Date(startOfToday);
    last7Start.setDate(startOfToday.getDate() - 6);
    const prev7Start = new Date(last7Start);
    prev7Start.setDate(last7Start.getDate() - 7);
    const prev7End = new Date(last7Start);
    prev7End.setDate(last7Start.getDate() - 1);

    let last7Total = 0;
    let prev7Total = 0;

    monthExpenses.forEach((e) => {
      const d = new Date(e.date);
      const amount = Number(e.amount) || 0;
      if (d >= last7Start && d <= now) {
        last7Total += amount;
      } else if (d >= prev7Start && d <= prev7End) {
        prev7Total += amount;
      }
    });

    if (prev7Total > 0) {
      const weeklyChange = ((last7Total - prev7Total) / prev7Total) * 100;
      if (weeklyChange >= 20) {
        addRecommendation({
          type: "projection",
          title: "📈 Weekly Spike",
          description: `This week spending is ${weeklyChange.toFixed(0)}% higher than last week. Watch high-frequency purchases.`,
        });
      } else if (weeklyChange <= -20) {
        addRecommendation({
          type: "on_track",
          title: "✅ Weekly Improvement",
          description: `Great job! This week spending is ${Math.abs(weeklyChange).toFixed(0)}% lower than last week.`,
        });
      }
    }

    // Frequent small transactions can silently add up
    const smallTxn = monthExpenses.filter((e) => Number(e.amount) <= 200);
    const smallTxnTotal = smallTxn.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    if (
      smallTxn.length >= 6 &&
      totalMonthly > 0 &&
      (smallTxnTotal / totalMonthly) * 100 >= 20
    ) {
      addRecommendation({
        type: "high_spend",
        title: "🧾 Small Spend Pattern",
        description: `${smallTxn.length} small transactions add up to ₹${smallTxnTotal.toFixed(0)} this month. Group similar purchases to save more.`,
        percentage: (smallTxnTotal / totalMonthly) * 100,
      });
    }

    // Positive reinforcement when budget usage is healthy
    if (budget && totalMonthly <= budget * 0.5) {
      addRecommendation({
        type: "on_track",
        title: "🌿 Budget Cushion",
        description: `You've used ${((totalMonthly / budget) * 100).toFixed(0)}% of your budget so far. Keep this pace to end the month strong.`,
      });
    }

    // Ensure at least 2 meaningful recommendations when data exists
    if (recommendations.length < 2 && sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      addRecommendation({
        type: "on_track",
        title: "📌 Focus Category",
        description: `${topCategory} contributes ₹${topAmount.toFixed(0)} this month. A small cut here will create the fastest savings impact.`,
      });
    }

    // No recommendations yet
    if (recommendations.length === 0) {
      addRecommendation({
        type: "on_track",
        title: "✅ You're On Track",
        description: "Your spending looks good so far!",
      });
    }

    return recommendations;
  }

  /**
   * Predict end-of-month spending
   * @param {Array} expenses - User's expense data
   * @returns {Object} - Prediction
   */
  predictMonthlySpending(expenses) {
    if (!expenses || expenses.length === 0) {
      return { predicted: 0, confidence: 0, message: "Not enough data" };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysSoFar = now.getDate();

    const monthExpenses = expenses.filter((e) => {
      const expDate = new Date(e.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    if (monthExpenses.length === 0) {
      return {
        predicted: 0,
        confidence: 0,
        message: "No expenses this month yet",
      };
    }

    const totalSoFar = monthExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const dailyAverage = totalSoFar / daysSoFar;
    const predicted = dailyAverage * daysInMonth;

    return {
      predicted: Math.round(predicted),
      totalSoFar: Math.round(totalSoFar),
      dailyAverage: Math.round(dailyAverage),
      daysRemaining: daysInMonth - daysSoFar,
      confidence: Math.min(daysSoFar / 15, 1), // Confidence increases with more data
    };
  }

  /**
   * Generate summary of expenses for context
   * @param {Array} expenses - User's expense data
   * @returns {string} - Summary text
   */
  generateExpenseSummary(expenses) {
    if (!expenses || expenses.length === 0) {
      return "No expenses recorded yet.";
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = expenses.filter((e) => {
      const expDate = new Date(e.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    if (monthExpenses.length === 0) {
      return "No expenses this month.";
    }

    const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const categories = {};

    monthExpenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
    });

    const categoryList = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)}`)
      .join(", ");

    return `Total this month: ₹${total.toFixed(0)}. Breakdown: ${categoryList}`;
  }
}

module.exports = new AIService();
