#!/usr/bin/env node

import { program } from 'commander';
import databaseManager from '../src/database/index.js';
import seeder from '../src/seeders/index.js';

// Configure CLI program
program
  .name('database-manager')
  .description('Database management CLI for Roll & Charge Fleet Management')
  .version('1.0.0');

// Seed command
program
  .command('seed')
  .description('Seed the database with initial data')
  .option('--clear', 'Clear existing data before seeding')
  .action(async (options) => {
    try {
      console.log('🚀 Starting database seeding process...');
      
      // Connect to database
      await databaseManager.connect();
      
      // Clear database if requested
      if (options.clear) {
        await seeder.clearDatabase();
      }
      
      // Run seeder
      const result = await seeder.seedAll();
      
      console.log('📊 Seeding Results:');
      console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`   Message: ${result.message}`);
      
      if (result.data) {
        console.log(`   Fleets: ${result.data.fleets.length}`);
        console.log(`   Users: ${result.data.users.length}`);
        console.log(`   Vehicles: ${result.data.vehicles.length}`);
        console.log(`   Technicians: ${result.data.technicians.length}`);
        console.log(`   Services: ${result.data.services.length}`);
        console.log(`   Service Requests: ${result.data.serviceRequests.length}`);
      }
      
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      process.exit(1);
    } finally {
      await databaseManager.disconnect();
      process.exit(0);
    }
  });

// Clear command
program
  .command('clear')
  .description('Clear all data from the database')
  .option('--confirm', 'Confirm that you want to clear all data')
  .action(async (options) => {
    try {
      if (!options.confirm) {
        console.log('⚠️ This will delete ALL data from the database!');
        console.log('Use --confirm flag to proceed: npm run db:clear -- --confirm');
        process.exit(1);
      }
      
      console.log('🗑️ Clearing database...');
      
      // Connect to database
      await databaseManager.connect();
      
      // Clear database
      await seeder.clearDatabase();
      
      console.log('✅ Database cleared successfully');
      
    } catch (error) {
      console.error('❌ Clear failed:', error.message);
      process.exit(1);
    } finally {
      await databaseManager.disconnect();
      process.exit(0);
    }
  });

// Status command
program
  .command('status')
  .description('Check database connection status')
  .action(async () => {
    try {
      console.log('📊 Checking database status...');
      
      // Connect to database
      await databaseManager.connect();
      
      // Get health check
      const health = await databaseManager.healthCheck();
      
      console.log('Database Status:');
      console.log(`   Type: ${health.type}`);
      console.log(`   Status: ${health.status}`);
      
      if (health.type === 'mongodb') {
        console.log(`   Host: ${health.host}`);
        console.log(`   Port: ${health.port}`);
        console.log(`   Database: ${health.name}`);
        console.log(`   Connection State: ${health.connection}`);
      } else if (health.type === 'in-memory') {
        console.log(`   Records: ${health.recordCount}`);
      }
      
      if (health.error) {
        console.log(`   Error: ${health.error}`);
      }
      
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
      process.exit(1);
    } finally {
      await databaseManager.disconnect();
      process.exit(0);
    }
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}