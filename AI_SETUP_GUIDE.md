# AI Financial Assistant Integration Guide

## 🚀 Quick Setup

This guide walks you through enabling the AI assistant feature in your Personal Expense Tracker app.

---

## 📋 What Was Added

### Backend Components:

1. **`/backend/services/aiService.js`** - Core AI service with methods for:
   - Chat responses using Google Gemini API
   - Expense insights generation
   - Spending recommendations
   - Monthly spending predictions

2. **`/backend/controllers/aiController.js`** - API endpoints for AI features:
   - `/api/ai/chat` - Chat with AI about expenses
   - `/api/ai/insights` - Get expense insights
   - `/api/ai/recommendations` - Get spending recommendations
   - `/api/ai/predict` - Get spending predictions

3. **`/backend/routes/aiRoutes.js`** - Express routes for AI endpoints

### Frontend Components:

1. **`/frontend/src/components/AIAssistant.jsx`** - Floating chat widget
   - Chat interface with message history
   - Real-time AI responses
   - Embedded suggestions

2. **`/frontend/src/components/AIInsights.jsx`** - Dashboard insights display
   - Key metrics and insights
   - Spending predictions
   - Personalized recommendations

---

## ⚙️ Installation Steps

### Step 1: Install Required Packages

#### Backend:

```bash
cd backend
npm install google-generative-ai axios
```

#### Frontend:

```bash
cd ../frontend
npm install axios react-icons react-toastify
```

**Note:** `axios` and `react-toastify` might already be installed. The above will just ensure they're present.

---

### Step 2: Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the generated API key

---

### Step 3: Configure Environment Variables

#### Backend `.env` file:

Add or update these lines in `/backend/.env`:

```env
# ... existing env variables ...

# Google Gemini API Key for AI Features
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the API key from Step 2.

---

### Step 4: Verify Backend Routes

The AI routes have been automatically added to your server. They are now available at:

- `POST /api/ai/chat` - Send messages
- `GET /api/ai/insights` - Get insights (requires authentication)
- `GET /api/ai/recommendations` - Get recommendations
- `GET /api/ai/predict` - Get predictions

All routes are protected and require `Authorization: Bearer <token>` header.

---

### Step 5: Verify Frontend Components

The AI components have been added to:

1. **`App.jsx`** - Imports and includes `<AIAssistant />` component
2. **`Dashboard.jsx`** - Imports and includes `<AIInsights />` component

Both will automatically appear in your app.

---

## 🎯 Features Explained

### 1. **AI Chat Assistant** (Floating Widget)

- Click the floating 💬 button in bottom-right corner
- Ask questions about your expenses:
  - "Where did I spend the most?"
  - "How can I save money?"
  - "Show my budget status"
  - "What's my daily average spending?"
- AI analyzes your actual expense data and responds

**Example Queries:**

```
Q: "Where did I spend the most this month?"
A: "Transport takes 35% of your budget, costing ₹2,450. Consider carpooling or public transit."

Q: "How's my budget looking?"
A: "You've spent ₹7,509 against ₹50,000 budget. You're on track with 15% utilized so far."
```

### 2. **AI Insights** (Dashboard Section)

Shows automatically on Dashboard with:

- **Key Metrics**: Total monthly spend, weekly pace, top category, highest spend day
- **Predictions**: Projected end-of-month spending based on current pace
- **Recommendations**: Personalized tips based on spending patterns
  - Budget alerts if you're overspending
  - High-spend category warnings
  - Savings opportunities

---

## 📊 Data Flow

```
User Input (Chat)
    ↓
Frontend (AIAssistant.jsx)
    ↓
   POST /api/ai/chat
    ↓
Backend (aiController.js)
    ↓
Fetch User Expenses (Database)
    ↓
Process with aiService.js
    ↓
Call Google Gemini API
    ↓
Formatted Response
    ↓
Frontend displays response
```

---

## 🔒 Security Notes

✅ **Protected by Default:**

- All AI routes require user authentication
- Each user only sees their own expense data
- API key is stored server-side (not exposed to frontend)
- User data is never sent to Google except for processing

---

## 🎨 Customization

### Modify AI Behavior

Edit `/backend/services/aiService.js`:

```javascript
// Change the system prompt (lines ~40-50)
const systemPrompt = `You are a personal finance assistant...`;

// Adjust tone, style, or add rules here
```

### Modify UI

Edit components:

- `/frontend/src/components/AIAssistant.jsx` - Chat widget styling
- `/frontend/src/components/AIInsights.jsx` - Insights display styling

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY not found"

**Solution:** Ensure `.env` has `GEMINI_API_KEY` set correctly. Restart backend server after.

### "AI Assistant not appearing"

**Solution:**

1. Check browser console for errors
2. Verify `AIAssistant` is imported in `App.jsx`
3. Ensure frontend is rebuilt

### "API calls returning 401"

**Solution:** User needs to be authenticated. Login first, then use chat.

### "No expenses to analyze"

**Solution:** Add some expenses first. AI needs data to generate insights.

---

## 📈 Future Enhancements

Possible improvements:

1. Add more AI models (OpenAI, Claude)
2. Schedule regular AI reminders
3. Expense categorization suggestions
4. Receipt OCR with AI
5. Voice input for chat
6. Export AI-generated reports

---

## 📞 Support

For issues or questions:

1. Check backend logs: `npm run dev`
2. Check browser console (F12)
3. Verify API key is valid
4. Ensure database has expense data

---

**Setup Complete!** 🎉

Your Personal Expense Tracker now has an intelligent AI assistant. Start chatting in the floating widget to get personalized financial insights!
