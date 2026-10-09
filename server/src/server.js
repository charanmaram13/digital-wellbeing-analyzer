import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';
import logger from './utils/logger.js';

async function bootstrap() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Digital Wellbeing Analyzer Server running on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`👉 API Health Endpoint: http://localhost:${env.PORT}/api/v1/health`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
