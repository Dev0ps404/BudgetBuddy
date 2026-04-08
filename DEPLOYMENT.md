# 🚀 Deployment Guide

## **BACKEND DEPLOYMENT ON RENDER**

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Create Render Account

- Go to [render.com](https://render.com)
- Sign up with GitHub
- Click "New +" → "Web Service"
- Select your repository
- Choose the backend folder as root directory

### Step 3: Configure Render

**Build Command:**

```
npm install
```

**Start Command:**

```
npm start
```

**Environment Variables** (Add in Render Dashboard):

```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_secret_key_123
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 4: Deploy

- Click "Deploy"
- Wait for build to complete
- **Copy your Render URL** (e.g., `https://budgetbuddy-backend.onrender.com`)
- Your backend is now live! 🎉

---

## **FRONTEND DEPLOYMENT ON VERCEL**

### Step 1: Push to GitHub (Already done above)

### Step 2: Create Vercel Account

- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub
- Click "Add New..." → "Project"
- Import your repository

### Step 3: Configure Vercel

**Root Directory:** Select `frontend`

**Build Settings:**

- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Environment Variables:**

```
VITE_API_URL=https://budgetbuddy-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

⚠️ **Replace `https://budgetbuddy-backend.onrender.com/api` with your actual Render URL**

### Step 4: Deploy

- Click "Deploy"
- Wait for build to complete
- **Your frontend is now live!** 🎉

---

## **UPDATE MONGODB URI FOR PRODUCTION**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add to Render environment variables as `MONGO_URI`

Example:

```
mongodb+srv://username:password@cluster.mongodb.net/budgetbuddy?retryWrites=true&w=majority
```

---

## **VERIFICATION CHECKLIST**

✅ Backend deployed on Render
✅ Frontend deployed on Vercel
✅ MONGO_URI set in Render
✅ VITE_API_URL set in Vercel pointing to Render backend
✅ Test API calls working from frontend
✅ JWT tokens being stored correctly
✅ Google OAuth configured for production domain

---

## **TROUBLESHOOTING**

### Frontend shows "Connection refused"

- Check if VITE_API_URL is correct in Vercel dashboard
- Make sure Render backend is running

### Backend not responding

- Check Render logs for errors
- Verify MONGO_URI is valid and accessible
- Check that all environment variables are set

### CORS errors

- Ensure backend has `cors()` enabled (already done in your code)
- Backend CORS is configured to accept all origins

---

## **POST-DEPLOYMENT STEPS**

1. **Test your app**: Visit your Vercel frontend URL
2. **Sign up and test features**
3. **Monitor logs** in both Render and Vercel dashboards
4. **Set up automated deployments** (GitHub auto-deploys on push)

---

**Congratulations! Your app is now live! 🌍**
