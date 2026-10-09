import { isDatabaseConnected } from '../config/database.js';
import { isGeminiAvailable } from '../ai/geminiProvider.js';
import ApiResponse from '../utils/apiResponse.js';

export const healthController = {
  async check(req, res) {
    const dbStatus = isDatabaseConnected() ? 'connected' : 'disconnected';
    const aiStatus = isGeminiAvailable() ? 'available' : 'fallback_mode';

    const healthData = {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      services: {
        database: dbStatus,
        aiProvider: aiStatus,
      },
      version: '1.0.0',
    };

    const statusCode = dbStatus === 'connected' ? 200 : 503;
    return ApiResponse.success(res, statusCode, healthData);
  },
};

export default healthController;
