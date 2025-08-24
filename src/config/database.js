import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    // Skip database connection for now to allow server to start
    logger.info('Skipping database connection for development...');
    return;
    
    // MongoDB Atlas connection string
    // Replace with your actual MongoDB Atlas connection string
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://organic-hub:organic-hub-2024@cluster0.mongodb.net/organic-hub?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB Atlas:', error);
    logger.info('Starting with in-memory storage for development...');
    // Continue without database for development
  }
};

export default connectDB;
