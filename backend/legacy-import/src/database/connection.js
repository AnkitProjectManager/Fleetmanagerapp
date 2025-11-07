import mongoose from 'mongoose';
import { config } from '../config/index.js';

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log('📊 Database already connected');
        return this.connection;
      }

      // Configure MongoDB connection options
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4 // Use IPv4, skip trying IPv6
      };

      // Connect to MongoDB (required for production)
      if (config.database.type === 'mongodb' && config.database.uri) {
        console.log('🔌 Connecting to MongoDB...');
        
        this.connection = await mongoose.connect(config.database.uri, options);
        this.isConnected = true;

        console.log('✅ MongoDB connected successfully');
        console.log(`📍 Database: ${this.connection.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (error) => {
          console.error('❌ MongoDB connection error:', error);
          this.isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
          console.log('🔌 MongoDB disconnected');
          this.isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
          console.log('🔄 MongoDB reconnected');
          this.isConnected = true;
        });

        return this.connection;
      }

      // If configuration is missing, fail fast — no in-memory fallback in production-ready mode
      throw new Error('MongoDB configuration missing: set DATABASE_TYPE=mongodb and MONGODB_URI in your environment');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message || error);
      this.isConnected = false;
      // Fail fast — do not continue without a DB connection
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected && mongoose.connection) {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log('🔌 Database disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      state: mongoose.connection?.readyState,
      name: mongoose.connection?.name,
      host: mongoose.connection?.host,
      port: mongoose.connection?.port
    };
  }
}

export default new DatabaseConnection();