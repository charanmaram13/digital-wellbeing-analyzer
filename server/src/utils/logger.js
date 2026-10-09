import env from '../config/env.js';

export const logger = {
  info: (msg, meta = '') => {
    if (env.NODE_ENV !== 'test') {
      console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta);
    }
  },
  warn: (msg, meta = '') => {
    if (env.NODE_ENV !== 'test') {
      console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, meta);
    }
  },
  error: (msg, meta = '') => {
    if (env.NODE_ENV !== 'test') {
      console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, meta);
    }
  },
  debug: (msg, meta = '') => {
    if (env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${msg}`, meta);
    }
  },
};

export default logger;
