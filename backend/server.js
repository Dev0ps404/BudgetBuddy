require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoMemoryServer } = require("mongodb-memory-server");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/ai", aiRoutes);

// General Root
app.get("/", (req, res) => res.send("API is running..."));

// Start Express server first (so API is reachable)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// DB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      // Connect to real MongoDB Cluster (Production/Persistent)
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        connectTimeoutMS: 10000,
      });
      console.log("MongoDB (Cloud Atlas) Connected Successfully!");
    } else {
      // Create a simulated MongoDB server in memory (Local Dev)
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log("MongoDB (In-Memory Dummy) Connected Successfully!");
    }
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();
