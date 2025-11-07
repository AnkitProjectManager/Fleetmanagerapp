import { config } from '../config/index.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };
  
  // Validation errors
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = err.details;
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }
  
  // Duplicate key error (for future database implementation)
  if (err.code === 11000) {
    error.status = 400;
    error.message = 'Duplicate field value';
  }
  
  // Cast error (for future database implementation)
  if (err.name === 'CastError') {
    error.status = 400;
    error.message = 'Invalid ID format';
  }
  
  // Don't leak error details in production
  if (config.nodeEnv === 'production' && error.status === 500) {
    error.message = 'Internal Server Error';
  }
  
  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
};