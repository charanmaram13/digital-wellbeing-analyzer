import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional().default(''),
  COOKIE_SECURE: z.string().optional().transform((val) => val === 'true'),
});

let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Configuration Error: Missing or invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const env = parsedEnv;
export default env;
