// Modern Database Manager with MongoDB and In-Memory fallback
import mongoose from 'mongoose';
import { connectDatabase, initializeDatabase } from '../schemas/index.js';
import { config } from '../config/index.js';

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.databaseType = null;
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log('📍 Database already connected');
        return this.connection;
      }

      // Use MongoDB URI from config, fallback to in-memory if not provided
      if (config.database.type === 'mongodb' && config.database.uri) {
        console.log('🔌 Connecting to MongoDB database...');
        this.connection = await connectDatabase(config.database.uri);
        this.databaseType = 'mongodb';
        
        // Initialize database indexes
        await initializeDatabase();
        
        this.isConnected = true;
        console.log('✅ MongoDB database connected and initialized');
        
        return this.connection;
      } else {
        console.log('⚠️ MongoDB URI not configured, using in-memory database');
        // Keep existing in-memory database for backward compatibility
        const { InMemoryDatabase } = await import('./memory/index.js');
        this.connection = new InMemoryDatabase();
        this.connection.initializeSampleData(); // Add sample data for development
        this.databaseType = 'memory';
        this.isConnected = true;
        console.log('✅ In-memory database initialized with sample data');
        return this.connection;
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      
      // Fallback to in-memory database on connection failure
      console.log('🔄 Falling back to in-memory database...');
      try {
        const { InMemoryDatabase } = await import('./memory/index.js');
        this.connection = new InMemoryDatabase();
        this.connection.initializeSampleData(); // Add sample data for development
        this.databaseType = 'memory';
        this.isConnected = true;
        console.log('✅ In-memory database initialized as fallback');
        return this.connection;
      } catch (fallbackError) {
        console.error('❌ Fallback to in-memory database also failed:', fallbackError);
        throw new Error('Failed to initialize any database connection');
      }
    }
  }

  async disconnect() {
    try {
      if (this.databaseType === 'mongodb' && mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('🔌 MongoDB disconnected');
      } else if (this.databaseType === 'memory') {
        console.log('🔌 In-memory database disconnected');
      }
      this.isConnected = false;
      this.connection = null;
      this.databaseType = null;
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
      throw error;
    }
  }

  getConnection() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.connection;
  }

  isMongoDatabase() {
    return this.databaseType === 'mongodb' && mongoose.connection.readyState === 1;
  }

  isMemoryDatabase() {
    return this.databaseType === 'memory';
  }

  getDatabaseType() {
    return this.databaseType;
  }

  async healthCheck() {
    try {
      if (this.isMongoDatabase()) {
        // MongoDB health check
        await mongoose.connection.db.admin().ping();
        return {
          status: 'healthy',
          type: 'mongodb',
          connection: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        };
      } else if (this.isMemoryDatabase() && this.connection) {
        // In-memory database health check
        return {
          status: 'healthy',
          type: 'in-memory',
          recordCount: this.connection.getTotalRecordCount ? this.connection.getTotalRecordCount() : 'unknown'
        };
      }
      
      return {
        status: 'disconnected',
        type: 'none'
      };
    } catch (error) {
      return {
        status: 'error',
        type: this.databaseType || 'unknown',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Auto-initialize database connection
databaseManager.connect().catch(error => {
  console.error('❌ Failed to auto-initialize database:', error);
});

// Export the database manager instance and legacy compatibility
export { DatabaseManager };
export default databaseManager;

// Legacy compatibility exports (for existing code)
export const db = databaseManager;

// Helper functions
export const getDatabase = () => {
  return databaseManager.getConnection();
};

export const isMongoDatabase = () => {
  return databaseManager.isMongoDatabase();
};

export const getDatabaseType = () => {
  return databaseManager.getDatabaseType();
};