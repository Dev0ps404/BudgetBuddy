# AI Assistant - Quick Installation Checklist

## ✅ Backend Setup (5 minutes)

- [ ] Open terminal and go to backend folder: `cd backend`
- [ ] Install packages: `npm install google-generative-ai axios`
- [ ] Open `.env` file in backend folder
- [ ] Add this line: `GEMINI_API_KEY=your_api_key_here`
- [ ] Get free API key from: https://aistudio.google.com/app/apikey
- [ ] Restart backend: `npm run dev`

## ✅ Frontend Setup (2 minutes)

- [ ] Open terminal and go to frontend folder: `cd frontend`
- [ ] Install packages: `npm install`
- [ ] Verify AIAssistant component is imported in `src/App.jsx`
- [ ] Verify AIInsights component is imported in `src/pages/Dashboard.jsx`
- [ ] Restart frontend: `npm run dev`

## ✅ Test the Integration (2 minutes)

- [ ] Login to the app
- [ ] Go to Dashboard
- [ ] Look for AI Insights section (should show below main charts)
- [ ] Click floating chat bubble in bottom-right corner
- [ ] Type a test message: "What's my total monthly spending?"
- [ ] AI should respond with your actual expense data

## 📦 Files Added

**Backend:**

- `backend/services/aiService.js` - AI logic
- `backend/controllers/aiController.js` - API endpoints
- `backend/routes/aiRoutes.js` - Route definitions

**Frontend:**

- `frontend/src/components/AIAssistant.jsx` - Chat widget
- `frontend/src/components/AIInsights.jsx` - Insights display

**Modified Files:**

- `backend/server.js` - Added AI routes
- `frontend/src/App.jsx` - Added AIAssistant component
- `frontend/src/pages/Dashboard.jsx` - Added AIInsights component

## 🎯 Features

✅ AI Chat Widget - Ask about expenses  
✅ AI Insights Dashboard - Automatic analysis  
✅ Spending Predictions - ML-based forecasts  
✅ Personalized Recommendations - Smart tips  
✅ Budget Alerts - Overspend warnings

## 🔗 API Endpoints

```
POST   /api/ai/chat           (Send message to AI)
GET    /api/ai/insights       (Get expense insights)
GET    /api/ai/recommendations (Get budget tips)
GET    /api/ai/predict        (Get spending forecast)
```

All endpoints require authentication.

## 🆘 Need Help?

1. Check `.env` file has correct API key
2. Check browser console for errors (F12)
3. Ensure backend is running on port 5000
4. Restart both frontend and backend after changes
5. Clear browser cache if needed

## 💡 Example Questions to Ask AI

- "Where did I spend the most?"
- "How much did I spend on transport?"
- "Show me my last 7 days spending"
- "Can I reduce my budget?"
- "What's my average daily spending?"
- "Show my spending by category"

---

**That's it!** Your AI assistant is ready to use. 🤖
