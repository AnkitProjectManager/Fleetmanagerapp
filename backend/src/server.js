import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import passport from './config/passport.js';
import database from './database/connection.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
// Import other routes as they're created

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration (for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Compression
app.use(compression());

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Health check endpoint
app.get('/', (req, res) => {
  const dbStatus = database.getConnectionStatus();
  res.json({
    success: true,
    message: 'Roll and Charge Fleet Manager Portal API Server',
    version: '1.0.0',
    environment: config.nodeEnv,
    database: {
      connected: dbStatus.isConnected,
      type: config.database.type
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = database.getConnectionStatus();
  res.json({
    success: true,
    message: 'Roll and Charge Fleet Manager Portal API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database: dbStatus
  });
});

// API routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/vehicles`, vehicleRoutes);

// Import and add service request routes
import serviceRequestRoutes from './routes/serviceRequests.js';
app.use(`/api/${config.apiVersion}/service-requests`, serviceRequestRoutes);

// Handle 404
app.use('*', notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();

    // Ensure DB connected before starting server
    if (!database.isConnected) {
      throw new Error('Database connection not established');
    }
    
    // Start server
    const PORT = config.port;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Roll and Charge Fleet Manager Portal API server running on port ${PORT}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 CORS enabled for: ${config.cors.origin.join(', ')}`);
      console.log(`📊 API Version: ${config.apiVersion}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      
      const dbStatus = database.getConnectionStatus();
      console.log(`💾 Database: ${dbStatus.isConnected ? 'Connected' : 'Using in-memory storage'}`);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message || error);
    // Exit with non-zero to indicate failure
    process.exit(1);
  }
}

const server = await startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await database.disconnect();
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(async () => {
    await database.disconnect();
    console.log('Process terminated');
  });
});

export default app;