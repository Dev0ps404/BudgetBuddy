# AI Assistant - Architecture & Integration Details

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  AIAssistant.jsx          AIInsights.jsx                │
│  ├─ Chat UI               ├─ Insights Display           │
│  ├─ Message History       ├─ Predictions               │
│  ├─ Input Handler         └─ Recommendations           │
│  └─ API Calls
│       ↓ axios.post("/api/ai/chat")
│       ↓ axios.get("/api/ai/insights")
│       ↓ axios.get("/api/ai/predict")
│
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Express.js)                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  aiRoutes.js              aiController.js               │
│  ├─ POST /chat            ├─ chatWithAI()              │
│  ├─ GET /insights         ├─ getInsights()             │
│  ├─ GET /recommendations  ├─ getRecommendations()      │
│  └─ GET /predict          └─ predictSpending()         │
│       ↓
│  aiService.js             Expense Model                │
│  ├─ generateChatResponse()│ ├─ user (ref)              │
│  ├─ generateInsights()    │ ├─ amount                  │
│  ├─ generateRecs()        │ ├─ category                │
│  └─ predictSpending()     │ ├─ description             │
│       ↓                    │ └─ date                    │
│  Google Gemini API
│  └─ LLM Processing
│
└─────────────────────────────────────────────────────────┘
                           ↓ Database
┌─────────────────────────────────────────────────────────┐
│               MongoDB (User Expenses)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow - Chat Request

```
1. User types message in AIAssistant.jsx
2. onClick: handleSendMessage()
3. axios.post('/api/ai/chat', { message })
   ↓
4. Backend receives POST request
5. Middleware: protect (verify JWT token)
   ↓
6. aiController.chatWithAI()
7. Fetch user's expenses: Expense.find({ user: req.user.id })
   ↓
8. Call aiService.generateChatResponse()
   - Generate summary of expenses
   - Create system prompt with context
   - Add user question
   ↓
9. Call Google Gemini API
   - Send prompt with user data
   - Get LLM response back
   ↓
10. Return response: { reply: "AI Response" }
   ↓
11. Frontend receives response
12. Add message to chat history
13. Display AI response in chat UI
```

---

## 📤 Data Flow - Insights Request

```
1. Dashboard page loads
2. AIInsights.jsx useEffect triggers
3. Promise.all([
     axios.get('/api/ai/insights'),
     axios.get('/api/ai/recommendations'),
     axios.get('/api/ai/predict')
   ])
   ↓
4. Backend processes each request
   - All require authentication
   - Fetch user's expenses
   ↓
5. aiService methods process data:
   - generateInsights() → Categories, totals, trends
   - generateRecommendations() → Budget analysis, tips
   - predictMonthlySpending() → Trend projection
   ↓
6. Return structured JSON data
   ↓
7. Frontend renders insights in cards/widgets
```

---

## 🧠 AI Service Methods

### `generateChatResponse(question, expenses, user)`

**Purpose:** Generate natural language response to user questions

**Input:**

- `question` (string) - User's question
- `expenses` (Array) - User's expense data
- `user` (Object) - User object with name, budget

**Process:**

1. Create system prompt with context
2. Summarize user's expense data
3. Add user question to prompt
4. Call Google Gemini API with full context
5. Return LLM response

**Output:**

```javascript
"You spent ₹7,509 this month across 2 categories.
Transport is your highest at 35% (₹2,625).
You're on track with your ₹50,000 budget."
```

### `generateInsights(expenses)`

**Purpose:** Analyze expenses and return structured insights

**Returns:**

```javascript
{
  status: "success",
  totalMonthly: 7509,
  weekTotal: 2100,
  categoryBreakdown: {
    "Transport": 2625,
    "Dining & Food": 4884
  },
  insights: [
    {
      type: "total_monthly",
      title: "Monthly Total",
      value: "₹7509",
      icon: "💰"
    },
    // ... more insights
  ]
}
```

### `generateRecommendations(expenses, budget)`

**Purpose:** Create personalized budget recommendations

**Returns:**

```javascript
[
  {
    type: "high_spend",
    title: "📍 Transport Alert",
    description: "35% of spending goes to Transport. Consider optimizing.",
  },
  {
    type: "budget_warning",
    title: "⚠️ Budget Alert",
    description: "Only ₹42,491 left in your ₹50,000 budget",
  },
  // ... more recommendations
];
```

### `predictMonthlySpending(expenses)`

**Purpose:** Predict end-of-month spending

**Returns:**

```javascript
{
  predicted: 9500,
  totalSoFar: 7509,
  dailyAverage: 1251,
  daysRemaining: 23,
  confidence: 0.85 // 85% confidence based on data points
}
```

---

## 🔐 Security Implementation

### Authentication

- All AI endpoints require JWT token (via `protect` middleware)
- Token extracted from Authorization header
- User ID verified before data access

### Data Isolation

- Each user only accesses their own expenses
- Query filter: `{ user: req.user.id }`
- No cross-user data exposure

### API Key Security

- GEMINI_API_KEY stored in `.env` (server-side only)
- Never exposed to frontend
- Never logged or stored in database

### Rate Limiting (Optional Enhancement)

```javascript
// Could add to protect against abuse
app.use(
  "/api/ai/",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
```

---

## 📊 Example Data Flow

### Scenario: User asks "Where do I spend most?"

**Frontend:**

```javascript
// User types in chat
input.value = "Where do I spend most?";

// Send to backend
axios.post("/api/ai/chat", {
  message: "Where do I spend most?",
});
```

**Backend - aiService.js:**

```javascript
// 1. Fetch expenses
Expense.find({ user: userId })
// Returns:
[
  { amount: 1500, category: "Transport", date: "2026-04-07" },
  { amount: 2000, category: "Dining & Food", date: "2026-04-06" },
  // ... more expenses
]

// 2. Generate summary
const summary = "Total this month: ₹7,509. Breakdown:
Transport: ₹2,625, Dining & Food: ₹4,884"

// 3. Create prompt
const prompt = `
You are a personal finance assistant.
User's monthly budget: ₹50,000
Current data: Total: ₹7,509. Transport: ₹2,625 (35%).
User question: Where do I spend most?
`

// 4. Call Gemini API
const response = await axios.post(
  'https://generativelanguage.googleapis.com/v1beta/...',
  { contents: [{ parts: [{ text: prompt }] }] },
  { params: { key: GEMINI_API_KEY } }
)

// 5. Return response
return response.data.candidates[0].content.parts[0].text
```

**Response to User:**

```
"Based on your expenses, Transport is your biggest spender
at ₹2,625 (35% of total). You could save money by using
public transit more or carpooling."
```

---

## 🛠️ Integration Points

### In `server.js`:

```javascript
// Added import
const aiRoutes = require("./routes/aiRoutes");

// Added route
app.use("/api/ai", aiRoutes);
```

### In `App.jsx`:

```javascript
// Added import
import AIAssistant from "./components/AIAssistant";

// Added in App return
<AIAssistant />; // Global chat widget
```

### In `Dashboard.jsx`:

```javascript
// Added import
import AIInsights from "../components/AIInsights";

// Added in return JSX
<AIInsights />; // Shows below main charts
```

---

## ⚡ Performance Considerations

### Current Implementation:

- **Chat Response Time:** ~2-3 seconds (Gemini API call)
- **Insights Generation:** <1 second (local calculations)
- **Data Fetching:** ~100-500ms (database query)

### Optimization Options:

1. **Cache insights** - Store generated insights for 1 hour
2. **Paginate expenses** - Load only last 90 days for analysis
3. **Debounce chat** - Prevent rapid repeated API calls
4. **Use webhooks** - Pre-generate insights periodically

---

## 🚀 Deployment Checklist

- [ ] Set `GEMINI_API_KEY` in production `.env`
- [ ] Enable CORS for frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable rate limiting on AI endpoints
- [ ] Add error logging (Sentry/LogRocket)
- [ ] Test all AI features in production
- [ ] Monitor API quota usage
- [ ] Set up alerts for API failures

---

## 📚 References

- [Google Gemini API Docs](https://ai.google.dev/)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [React Hooks](https://react.dev/reference/react)
- [MongoDB Queries](https://docs.mongodb.com/manual/crud/)

---

This architecture ensures scalability, security, and excellent user experience! 🎉
