# 💸 BudgetBuddy (MERN Stack)

A modern **Personal Expense Tracker Web Application** built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

It is designed to help users efficiently manage, track, and analyze their daily expenses with a clean, responsive, and user-friendly interface.

---

## 🚀 Features

- 🔐 **User Authentication:** Secure login and signup functionality  
- 📊 **Interactive Dashboard:** Real-time analytics and financial overview  
- 💰 **Expense Management:** Add, edit, and delete expenses easily  
- 📅 **Expense Tracking:** Monitor daily and monthly spending patterns  
- 📈 **Data Visualization:** Pie and bar charts for better insights  
- 🗂️ **Category Management:** Organize expenses (Food, Travel, Bills, etc.)  
- 🔍 **Search & Filter:** Quickly find and filter transactions  
- 🌙 **Dark Mode:** Enhanced UI experience with dark theme support  

---

## 🚀 Tech Stack

### 💻 Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

### 🗄️ Database
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

### 📊 Data Visualization
![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

### 🤖 AI Integration
![Google Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

### 🚀 Deployment
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

### 🛠️ Tools
![Git](https://img.shields.io/badge/Git-F05033?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)

---

## 📂 Project Structure

```
BudgetBuddy/
│
├── frontend/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Images, icons
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Pages (Dashboard, Login, etc.)
│   │   ├── services/         # API calls
│   │   ├── utils/            # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js Backend
│   ├── config/               # DB & environment config
│   ├── controllers/          # Business logic
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── middleware/           # Auth, error handling
│   ├── services/             # AI services (Gemini, etc.)
│   ├── utils/                # Helper functions
│   ├── server.js             # Entry point
│   └── package.json
│
├── .env                      # Environment variables
├── README.md                 # Project documentation
└── package.json              # Root (optional)
```
---

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Dev0ps404/BudgetBuddy.git
cd BudgetBuddy
```

---

### 2️⃣ Install dependencies

#### 📦 Frontend
```bash
cd frontend
npm install
```

#### ⚙️ Backend
```bash
cd ../backend
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file inside `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GEMINI_API_KEY=your_gemini_api_key
```

---

### 4️⃣ Run the project

#### ▶️ Start Backend
```bash
cd backend
npm start
```

#### ▶️ Start Frontend
```bash
cd frontend
npm run dev
```

---

### 🌐 Access the App
https://budget-buddy-two-zeta.vercel.app/


---

## 📸 Screenshots

### 🏠 Authentication Flow

<p align="center">
  <img src="./Screenshots/Home%20Page.jpeg" width="250"/>
  <img src="./Screenshots/Sign%20Up.jpeg" width="250"/>
  <img src="./Screenshots/Login.jpeg" width="250"/>
</p>

<p align="center">
  <sub>Home Page &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Sign Up &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Login</sub>
</p>

---

### 📊 Dashboard & Analytics

<p align="center">
  <img src="./Screenshots/Dashboard.jpeg" width="250"/>
  <img src="./Screenshots/Expenses.jpeg" width="250"/>
  <img src="./Screenshots/Reports.jpeg" width="250"/>
</p>

<p align="center">
  <sub>Dashboard &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Expenses &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Reports</sub>
</p>

---

### 🤖 AI & Settings

<p align="center">
  <img src="./Screenshots/AI%20Assistant.jpeg" width="250"/>
  <img src="./Screenshots/Settings.jpeg" width="250"/>
</p>

<p align="center">
  <sub>AI Assistant &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Settings</sub>
</p>

---

## 🔐 Security

Our application follows industry-standard security practices to ensure data protection and safe user interactions:

- 🔑 **Password Hashing:** User passwords are securely hashed using encryption techniques before storing in the database.
- 🛡️ **Input Validation:** All user inputs are validated and sanitized to prevent malicious data and injection attacks.
- 🚧 **Protected Routes:** Authentication-based access control ensures that only authorized users can access sensitive routes and resources.
- 🔒 **JWT Authentication:** Secure token-based authentication is implemented for session management.
- 🌐 **CORS Configuration:** Proper CORS policies are applied to restrict unauthorized cross-origin requests.
---

## 🚀 Future Improvements

We aim to continuously enhance the platform by introducing advanced features and improving user experience:

- 🔐 **Enhanced Authentication:** Implement advanced JWT-based authentication with refresh tokens and role-based access control.
- 📄 **Export Functionality:** Enable users to export reports in PDF and CSV formats for better financial tracking.
- 🚨 **Smart Budget Alerts:** Introduce real-time notifications when spending exceeds predefined limits.
- 🤖 **AI-Powered Insights:** Provide intelligent expense analysis and personalized financial recommendations using AI.
- 💳 **UPI Integration:** Allow seamless transactions and real-time expense tracking through UPI connectivity.

---

## 👨‍💻 Team & Responsibilities

- 🚀 **Devansh Agarwal** — Project Leader, Backend Developer & System Architect  
- 🎨 **Govind Rana** — Frontend Developer  
- 📊 **Gagan** — JavaScript & Charts Developer  
- 🧪 **Sanskar** — Tester & Debugger  
---

## ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.  
Your support motivates us to keep improving and building more impactful solutions!
