import mongoose from 'mongoose';
import { config } from '../config/index.js';

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
    this.databaseType = null;
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
        this.databaseType = 'mongodb';

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

      // Otherwise use the in-memory database for local development/testing
      console.warn('⚠️ MongoDB configuration missing, using in-memory database');
      const { InMemoryDatabase } = await import('./memory/index.js');
      this.connection = new InMemoryDatabase();
      if (typeof this.connection.initializeSampleData === 'function') {
        this.connection.initializeSampleData();
      }
      this.isConnected = true;
      this.databaseType = 'memory';
      console.log('✅ In-memory database initialized with sample data');
      return this.connection;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message || error);
      this.isConnected = false;
      this.databaseType = null;
      // Fail fast — do not continue without a DB connection
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.databaseType === 'mongodb' && this.isConnected && mongoose.connection) {
        await mongoose.connection.close();
        console.log('🔌 MongoDB disconnected');
      } else if (this.databaseType === 'memory' && this.isConnected) {
        console.log('🔌 In-memory database reset');
      }
      this.isConnected = false;
      this.connection = null;
      this.databaseType = null;
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }

  getConnectionStatus() {
    if (this.databaseType === 'mongodb') {
      return {
        isConnected: this.isConnected,
        type: 'mongodb',
        state: mongoose.connection?.readyState,
        name: mongoose.connection?.name,
        host: mongoose.connection?.host,
        port: mongoose.connection?.port
      };
    }

    if (this.databaseType === 'memory') {
      return {
        isConnected: this.isConnected,
        type: 'memory'
      };
    }

    return {
      isConnected: false,
      type: 'unknown'
    };
  }
}

export default new DatabaseConnection();