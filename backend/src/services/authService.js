import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config/index.js';

export class AuthService {
  static async login(email, password) {
    try {
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error('Account is not active');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role,
          fleetId: user.fleetId
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  static async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, config.bcryptRounds);

      // Create user
      const newUser = await User.create({
        ...userData,
        password: hashedPassword,
        status: 'active'
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email,
          role: newUser.role,
          fleetId: newUser.fleetId
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId, updateData) {
    try {
      // Don't allow updating password, email, or role through this method
      const { password, email, role, ...allowedUpdates } = updateData;
      
      const updatedUser = await User.update(userId, allowedUpdates);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

      // Update password
      await User.update(userId, { password: hashedPassword });
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService;