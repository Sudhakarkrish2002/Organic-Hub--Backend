import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    // MongoDB localhost connection string
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/organic-hub';
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    logger.info('Starting with in-memory storage for development...');
    // Continue without database for development
  }
};

export default connectDB;
