import mongoose from 'mongoose';

// Import all schema models
import User from './User.js';
import Fleet from './Fleet.js';
import Vehicle from './Vehicle.js';
import ServiceRequest from './ServiceRequest.js';
import Technician from './Technician.js';
import Service from './Service.js';
import Invoice from './Invoice.js';

// Export all models
export {
  User,
  Fleet,
  Vehicle,
  ServiceRequest,
  Technician,
  Service,
  Invoice
};

// Default export with all models
export default {
  User,
  Fleet,
  Vehicle,
  ServiceRequest,
  Technician,
  Service,
  Invoice
};

// Database connection helper
export const connectDatabase = async (connectionString, options = {}) => {
  try {
    const defaultOptions = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      ...options
    };

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(connectionString, defaultOptions);
    
    console.log('✅ MongoDB connected successfully');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🛑 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB connection cleanup:', err);
        process.exit(1);
      }
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

// Database initialization helper
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database indexes...');

    const models = [
      { name: 'User', model: User },
      { name: 'Fleet', model: Fleet },
      { name: 'Vehicle', model: Vehicle },
      { name: 'ServiceRequest', model: ServiceRequest },
      { name: 'Technician', model: Technician },
      { name: 'Service', model: Service },
      { name: 'Invoice', model: Invoice }
    ];

    // Create indexes for all models but ignore harmless duplicate conflicts
    for (const { name, model } of models) {
      try {
        await model.createIndexes();
        console.log(`✅ Indexes ensured for ${name}`);
      } catch (err) {
        // Mongo code 86 = IndexKeySpecsConflict (same name, different spec)
        // Also tolerate "Index already exists" style messages
        const msg = (err && err.message) || '';
        if (err?.code === 86 || /index( already)? exists/i.test(msg) || /IndexKeySpecsConflict/i.test(msg)) {
          console.warn(`⚠️  Skipping index conflict for ${name}: ${msg.split('\n')[0]}`);
          continue;
        }
        throw err;
      }
    }

    console.log('✅ Database indexes initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database indexes:', error);
    throw error;
  }
};