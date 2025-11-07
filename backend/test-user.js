import mongoose from 'mongoose';
import User from './src/models/User.js';
import { config } from './src/config/index.js';

const testUser = async () => {
  try {
    await mongoose.connect(config.database.uri);
    console.log('✅ Connected to MongoDB');
    
    const user = await User.findOne({ email: 'admin@rollcharge.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n📧 Email:', user.email);
    console.log('👤 Name:', user.firstName, user.lastName);
    console.log('🔐 Password hash:', user.password?.substring(0, 20) + '...');
    console.log('🔐 Hash length:', user.password?.length);
    console.log('✅ Email verified:', user.emailVerified);
    console.log('📊 Status:', user.status);
    
    // Test password comparison
    console.log('\n🔐 Testing password: "admin123"');
    const isValid = await user.comparePassword('admin123');
    console.log('✅ Password valid:', isValid);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
};

testUser();
