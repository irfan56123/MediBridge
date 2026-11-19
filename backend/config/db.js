const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error(
      'MONGO_URI is not set. Create backend/.env from backend/.env.example and set your MongoDB connection string.'
    );
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    throw new Error(`Could not connect to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
