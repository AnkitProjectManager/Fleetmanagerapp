import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Database Configuration
  database: {
    type: process.env.DATABASE_TYPE || 'memory',
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/roll-charge-fleet'
  },
  
  // Security Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads/'
  },
  
  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // External Service Configuration
  externalService: {
    appId: process.env.EXTERNAL_APP_ID,
    serverUrl: process.env.EXTERNAL_BACKEND_URL,
    token: process.env.EXTERNAL_ACCESS_TOKEN,
    functionsVersion: process.env.EXTERNAL_FUNCTIONS_VERSION || 'v1'
  }
};

export default config;