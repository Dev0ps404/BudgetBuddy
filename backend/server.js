require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// General Root
app.get('/', (req, res) => res.send('API is running...'));

// DB Connection & Server Start
const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      // Connect to real MongoDB Cluster (Production/Persistent)
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB (Cloud Atlas) Connected Successfully!');
    } else {
      // Create a simulated MongoDB server in memory (Local Dev)
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB (In-Memory Dummy) Connected Successfully!');
    }

    // Start the node server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
  }
};

startServer();
