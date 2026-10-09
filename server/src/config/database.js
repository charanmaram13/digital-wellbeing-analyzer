import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDatabase() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB Disconnected');
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export default { connectDatabase, disconnectDatabase, isDatabaseConnected };
