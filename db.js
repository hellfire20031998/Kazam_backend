require('dotenv').config(); // Load environment variables from .env

const mongoose = require('mongoose');

// MongoDB connection URL (from .env file)
const mongoDBUrl = process.env.MONGODB_URI;

const connectDb=()=>{
mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ Connected to MongoDB!");
    // process.exit();
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
}

module.exports = connectDb;

