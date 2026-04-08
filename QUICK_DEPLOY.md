# 🚀 QUICK DEPLOYMENT REFERENCE

## Prerequisites (Do These First)

- [ ] GitHub account with repository pushed
- [ ] MongoDB Atlas account (free tier available)
- [ ] Vercel account
- [ ] Render account

---

## **STEP 1: Deploy Backend on Render (5 mins)**

```
1. Go to render.com → Sign in with GitHub
2. New → Web Service
3. Select your GitHub repo → Continue
4. Settings:
   - Name: budgetbuddy-backend
   - Root Directory: backend
   - Build Command: npm install
   - Start Command: npm start

5. Environment Variables (click "Add from .env"):
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/budgetbuddy?retryWrites=true&w=majority
   JWT_SECRET=your_secret_key_123

6. Click "Create Web Service"
7. Wait for deployment (takes 2-3 mins)
8. Copy your URL: https://budgetbuddy-backend.onrender.com
```

---

## **STEP 2: Deploy Frontend on Vercel (5 mins)**

```
1. Go to vercel.com → Sign in with GitHub
2. New Project → Import your repository
3. Settings:
   - Framework: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Environment Variables:
     VITE_API_URL=https://budgetbuddy-backend.onrender.com/api
     VITE_GOOGLE_CLIENT_ID=your_google_client_id

4. Click "Deploy"
5. Wait for deployment (takes 1-2 mins)
6. Your URL will be like: https://budgetbuddy-app.vercel.app
```

---

## **That's it! Your app is live! 🎉**

**Frontend URL:** https://budgetbuddy-app.vercel.app
**Backend URL:** https://budgetbuddy-backend.onrender.com

---

## ⚠️ Important Notes

- **Render free tier goes to sleep** after 15 mins of inactivity (wakes up on first request, takes 30s)
- **To keep it always running**: Upgrade to paid plan
- **MongoDB Atlas free tier** is limited to 3 databases and 512MB storage
- **Vercel deployments** are instant and stay active 24/7
