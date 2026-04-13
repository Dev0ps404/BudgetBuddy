const crypto = require("crypto");
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
    this.responseCache = new Map();
    this.cacheTtlMs = Number(process.env.AI_CACHE_TTL_MS || 60 * 1000);
    this.maxCacheEntries = Number(process.env.AI_CACHE_MAX_ENTRIES || 300);

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

  getCachedResponse(cacheKey) {
    const cachedEntry = this.responseCache.get(cacheKey);
    if (!cachedEntry) {
      return null;
    }

    if (cachedEntry.expiresAt <= Date.now()) {
      this.responseCache.delete(cacheKey);
      return null;
    }

    return cachedEntry.reply;
  }

  setCachedResponse(cacheKey, reply) {
    if (this.responseCache.size >= this.maxCacheEntries) {
      const oldestKey = this.responseCache.keys().next().value;
      if (oldestKey) {
        this.responseCache.delete(oldestKey);
      }
    }

    this.responseCache.set(cacheKey, {
      reply,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  createContextHash(contextData) {
    const compactContext = {
      dataWindow: contextData?.dataWindow,
      user: {
        id: contextData?.user?.id,
        monthlyBudget: contextData?.user?.monthlyBudget,
      },
      summary: contextData?.expenses?.summary,
      byCategory: contextData?.expenses?.byCategory || [],
      recentTransactions: (
        contextData?.expenses?.recentTransactions || []
      ).slice(0, 25),
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(compactContext))
      .digest("hex");
  }

  createHistoryHash(history = []) {
    const safeHistory = Array.isArray(history) ? history.slice(-12) : [];
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(safeHistory))
      .digest("hex");
  }

  async generateDatabaseQueryResponse(question, contextData, options = {}) {
    const normalizedQuestion =
      typeof question === "string" ? question.trim() : "";

    if (!normalizedQuestion) {
      return {
        reply: "Please ask a valid question.",
        cached: false,
      };
    }

    const fallbackUser = {
      name: contextData?.user?.name || "Friend",
      monthlyBudget: Number(contextData?.user?.monthlyBudget || 0),
    };
    const fallbackExpenses = (
      contextData?.expenses?.recentTransactions || []
    ).map((item) => ({
      amount: item.amount,
      category: item.category,
      description: item.description || "",
      date: item.date,
    }));
    const history = Array.isArray(options.history)
      ? options.history.slice(-12)
      : [];
    const conversationHistoryText = history.length
      ? history
          .map(
            (item, index) =>
              `${index + 1}. ${item.role === "assistant" ? "Assistant" : "User"}: ${item.content}`,
          )
          .join("\n")
      : "No prior conversation.";

    try {
      if (!this.apiKey) {
        return {
          reply: this.generateLocalResponse(
            normalizedQuestion,
            fallbackExpenses,
            fallbackUser,
          ),
          cached: false,
        };
      }

      if (!this.model) {
        this.client = new GoogleGenerativeAI(this.apiKey);
        this.model = this.client.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
      }

      const contextHash =
        options.contextHash || this.createContextHash(contextData);
      const userId = options.userId || "anonymous";
      const historyHash = this.createHistoryHash(history);
      const cacheKey = crypto
        .createHash("sha256")
        .update(
          `${userId}|${normalizedQuestion.toLowerCase()}|${contextHash}|${historyHash}`,
        )
        .digest("hex");

      const cachedReply = this.getCachedResponse(cacheKey);
      if (cachedReply) {
        return { reply: cachedReply, cached: true };
      }

      const prompt = `You are a smart, friendly and professional AI financial assistant for a web app called BudgetBuddy.

    Your behavior should be similar to ChatGPT:
    - Understand user intent deeply
    - Give human-like, natural responses
    - Avoid generic replies
    - Be conversational and helpful
    - Detect emotional tone (stress, confusion, motivation, frustration) and acknowledge it naturally before advice.

    Your expertise:
    - Personal finance
    - Expense tracking
    - Budget planning
    - Saving strategies

    Rules:
    - Always give useful and actionable advice.
    - Use user's actual data when available.
    - If user asks casual or non-finance questions, respond naturally and helpfully.
    - Keep responses clear and structured.
    - Use bullet points when helpful.
    - For finance claims based on spending, rely only on provided data.
    - If finance data is missing, clearly mention what is missing and ask a helpful follow-up question.
    - Do not sound robotic.
    - Respond in the same language as the user when possible.

    Response style:
    - If user sounds emotional, begin with one short empathetic line.
    - Then give the direct answer.
    - For finance questions include: a quick insight, what to do next, and one practical step for today.
    - Keep normal responses concise; expand only when user asks for detail.

    User data:
    ${JSON.stringify(contextData, null, 2)}

    Recent conversation:
    ${conversationHistoryText}

    Current user message:
    ${normalizedQuestion}`;

      const result = await this.model.generateContent(prompt);
      const aiText = result?.response?.text()?.trim();

      if (!aiText) {
        throw new Error("Empty response from AI provider");
      }

      this.setCachedResponse(cacheKey, aiText);
      return { reply: aiText, cached: false };
    } catch (error) {
      console.error("❌ Database AI Query Error:", {
        message: error.message,
        code: error.code,
      });
      return {
        reply: this.generateLocalResponse(
          normalizedQuestion,
          fallbackExpenses,
          fallbackUser,
        ),
        cached: false,
      };
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

      // Core assistant behavior for BudgetBuddy chat responses
      const systemPrompt = `You are a smart, friendly and professional AI financial assistant for a web app called BudgetBuddy.

    Your behavior should be similar to ChatGPT:
    - Understand user intent deeply
    - Give human-like, natural responses
    - Avoid generic replies
    - Be conversational and helpful

    Your expertise:
    - Personal finance
    - Expense tracking
    - Budget planning
    - Saving strategies

    Rules:
    - Always give useful and actionable advice
    - Use user's actual data when available
    - If user asks casual questions, respond naturally (not robotic)
    - Keep responses clear and structured
    - Use bullet points when helpful

    Tone:
    - Friendly + intelligent + practical

    User financial context (if available):
    ${expenseContext || "No expense data available."}

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
      "savings",
      "category",
      "spent",
      "total",
      "monthly",
      "daily",
      "financial",
      "finance",
      "income",
      "salary",
      "spending",
      "transaction",
      "purchase",
      "bill",
      "bills",
      "rent",
      "loan",
      "emi",
      "debt",
      "credit",
      "cashflow",
      "cash flow",
      "paisa",
      "paise",
      "kharcha",
      "kharche",
      "bachat",
      "karza",
      "udhaar",
    ];
    const lowerQ = String(question || "").toLowerCase();
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

    const questionText = String(question || "").trim();
    const lowerQ = questionText.toLowerCase();
    const isExpenseQ = this.isExpenseQuestion(questionText);
    const isHinglish = [
      "kya",
      "kaise",
      "main",
      "mujhe",
      "mera",
      "meri",
      "paisa",
      "paise",
      "kharcha",
      "kharche",
      "bachat",
      "karun",
      "hoon",
      "nahi",
      "yaar",
      "bhai",
      "pareshan",
      "tension",
    ].some((kw) => lowerQ.includes(kw));

    const emotionKeywords = [
      "stress",
      "stressed",
      "tension",
      "anxious",
      "anxiety",
      "worried",
      "overwhelmed",
      "panic",
      "pressure",
      "pareshan",
      "ghabra",
    ];
    const moneyKeywords = [
      "money",
      "paisa",
      "paise",
      "expense",
      "spend",
      "budget",
      "bill",
      "loan",
      "emi",
      "debt",
      "salary",
      "income",
      "finance",
      "financial",
      "kharcha",
      "kharche",
      "bachat",
      "save",
    ];
    const isFinancialStress =
      emotionKeywords.some((kw) => lowerQ.includes(kw)) &&
      moneyKeywords.some((kw) => lowerQ.includes(kw));

    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const monthlyBudget = Number(user?.monthlyBudget || 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = safeExpenses.filter((e) => {
      const expDate = new Date(e.date);
      return (
        !Number.isNaN(expDate.getTime()) &&
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    const totalMonthly = monthExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );

    const categoryBreakdown = {};
    monthExpenses.forEach((e) => {
      const category = e.category || "Other";
      categoryBreakdown[category] =
        (categoryBreakdown[category] || 0) + Number(e.amount || 0);
    });

    const sortedCategories = Object.entries(categoryBreakdown).sort(
      (a, b) => b[1] - a[1],
    );

    if (isFinancialStress) {
      if (monthExpenses.length > 0 && sortedCategories.length > 0) {
        const [topCategory, topAmount] = sortedCategories[0];
        const topShare =
          totalMonthly > 0
            ? ((topAmount / totalMonthly) * 100).toFixed(0)
            : "0";
        const avgDaily = totalMonthly / Math.max(now.getDate(), 1);
        const suggestedDailyCap = Math.max(100, Math.round(avgDaily * 0.8));
        const budgetLine =
          monthlyBudget > 0 ? ` (budget: ₹${monthlyBudget.toFixed(0)})` : "";

        if (isHinglish) {
          return `Samajh sakta hoon, paise ka stress heavy lagta hai. Tum akela feel mat karo.\n- Is month spend: ₹${totalMonthly.toFixed(0)}${budgetLine}\n- Top pressure category: ${topCategory} (₹${topAmount.toFixed(0)}, ${topShare}%)\n- Aaj ka action: agle 7 din ${topCategory} spend ko 20% cut karo.\n- Daily cap try karo: ₹${suggestedDailyCap}\nAgar chaho to main abhi tumhare liye exact 7-day recovery plan bana deta hoon.`;
        }

        return `I hear you. Money stress can feel overwhelming, and you are not alone.\n- This month spend: ₹${totalMonthly.toFixed(0)}${budgetLine}\n- Biggest pressure category: ${topCategory} (₹${topAmount.toFixed(0)}, ${topShare}%)\n- Action for today: reduce ${topCategory} spend by 20% for the next 7 days.\n- Suggested daily cap: ₹${suggestedDailyCap}\nIf you want, I can create an exact 7-day recovery plan right now.`;
      }

      if (isHinglish) {
        return "Samajh sakta hoon, paise ka stress real hota hai.\n- Pehle 3 fixed kharche likho (rent, bill, EMI).\n- Next 7 din non-essential spending pause karo.\n- Daily limit set karo (₹300-₹500).\nAgar tum monthly budget share karo, main exact step-by-step plan de dunga.";
      }

      return "I hear you. Financial stress is real.\n- List your 3 fixed costs first (rent, bills, EMI/loan).\n- Pause non-essential spending for 7 days.\n- Set a temporary daily limit (₹300-₹500).\nShare your monthly budget, and I will build a concrete step-by-step plan.";
    }

    // For general questions, provide helpful fallback
    if (!isExpenseQ) {
      if (/(^|\s)(hello|hi|hey|namaste|namaskar)(\s|$)/i.test(lowerQ)) {
        return isHinglish
          ? "Hi! Main yahin hoon. Aap finance, budgeting, savings ya general sawal kuch bhi pooch sakte ho."
          : "Hi! I'm here to help. You can ask me about finance, budgeting, savings, or general questions.";
      }

      if (/(^|\s)(thanks|thank you|shukriya|dhanyavaad)(\s|$)/i.test(lowerQ)) {
        return isHinglish
          ? "Hamesha. Agar chaho to main aapke liye next best financial step bhi suggest kar sakta hoon."
          : "Anytime. If you want, I can suggest your best next financial step too.";
      }

      if (lowerQ.includes("help") || lowerQ.includes("madad")) {
        return isHinglish
          ? "Main aapki help kar sakta hoon:\n- Budget breakdown\n- Expense analysis\n- Savings strategy\n- Debt/EMI planning\nBas apna goal likho, main practical plan bana dunga."
          : "I can help with:\n- Budget breakdown\n- Expense analysis\n- Savings strategy\n- Debt/EMI planning\nShare your goal and I will create a practical plan.";
      }

      return isHinglish
        ? "Main samajh raha hoon. Thoda aur context do, main direct aur practical jawab dunga."
        : "I understand. Share a bit more context and I will give you a direct, practical answer.";
    }

    if (monthExpenses.length === 0) {
      return isHinglish
        ? "Is month ka expense data abhi empty hai. Start karne ke liye:\n- Har spend add karo\n- Category select karo\n- Daily limit set karo\nPhir main exact personalized advice dunga."
        : "I do not see expense data for this month yet. To get strong personalized advice:\n- Add each spend\n- Tag categories\n- Set a daily limit\nThen I can generate an exact plan for you.";
    }

    const questionLower = question.toLowerCase();

    // Handle common questions
    if (
      questionLower.includes("where") ||
      questionLower.includes("most") ||
      questionLower.includes("spend") ||
      questionLower.includes("highest") ||
      questionLower.includes("kaha") ||
      questionLower.includes("sabse")
    ) {
      const topCategory = sortedCategories[0];
      const percentage = ((topCategory[1] / totalMonthly) * 100).toFixed(0);
      return isHinglish
        ? `Sabse zyada spend ${topCategory[0]} me hai: ₹${topCategory[1].toFixed(0)} (${percentage}% of total). Is month total spend: ₹${totalMonthly.toFixed(0)}.`
        : `Your highest spending is on ${topCategory[0]}: ₹${topCategory[1].toFixed(0)} (${percentage}% of total). Total this month: ₹${totalMonthly.toFixed(0)}.`;
    }

    if (
      questionLower.includes("total") ||
      questionLower.includes("spent") ||
      questionLower.includes("budget") ||
      questionLower.includes("kitna") ||
      questionLower.includes("bacha") ||
      questionLower.includes("remaining")
    ) {
      let budgetStatus = "";
      if (monthlyBudget > 0) {
        const remaining = monthlyBudget - totalMonthly;
        budgetStatus =
          remaining >= 0
            ? ` Remaining budget: ₹${remaining.toFixed(0)}.`
            : ` You are over budget by ₹${Math.abs(remaining).toFixed(0)}.`;
      }

      return isHinglish
        ? `Aapne is month ₹${totalMonthly.toFixed(0)} spend kiya hai across ${sortedCategories.length} categories.${budgetStatus}`
        : `You've spent ₹${totalMonthly.toFixed(0)} this month across ${sortedCategories.length} categories.${budgetStatus}`;
    }

    if (
      questionLower.includes("category") ||
      questionLower.includes("breakdown") ||
      questionLower.includes("kharche") ||
      questionLower.includes("kharcha")
    ) {
      const breakdown = sortedCategories
        .map((c) => `${c[0]}: ₹${c[1].toFixed(0)}`)
        .join(", ");
      return isHinglish
        ? `Category-wise spend: ${breakdown}`
        : `Here's your spending by category: ${breakdown}`;
    }

    if (
      questionLower.includes("save") ||
      questionLower.includes("reduce") ||
      questionLower.includes("cut") ||
      questionLower.includes("bachat")
    ) {
      const topCategory = sortedCategories[0];
      return isHinglish
        ? `Bachat ke liye pehle ${topCategory[0]} reduce karo. Ye aapka highest expense hai: ₹${topCategory[1].toFixed(0)}.`
        : `To save money, focus on reducing ${topCategory[0]} spending, which is your highest expense at ₹${topCategory[1].toFixed(0)}.`;
    }

    // Default response
    return isHinglish
      ? `Is month aapne ₹${totalMonthly.toFixed(0)} spend kiya hai. Top category ${sortedCategories[0][0]} hai (₹${sortedCategories[0][1].toFixed(0)}). Aaj ka practical step: is category par agle 7 din 15-20% cut target rakho.`
      : `You've spent ₹${totalMonthly.toFixed(0)} this month. Your top spending category is ${sortedCategories[0][0]} (₹${sortedCategories[0][1].toFixed(0)}). Practical next step: target a 15-20% cut in this category for the next 7 days.`;
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
