import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/index.js';

export class AuthService {
  static async login(email, password, rememberMe = false) {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new Error('Account is temporarily locked due to too many failed login attempts');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error('Account is not active');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        await user.incLoginAttempts();
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Generate tokens
      const accessTokenExpiry = rememberMe ? '7d' : config.jwt.expiresIn;
      const refreshTokenExpiry = rememberMe ? '30d' : '7d';

      const accessToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role,
          fleetId: user.fleetId,
          type: 'access'
        },
        config.jwt.secret,
        { expiresIn: accessTokenExpiry }
      );

      const refreshToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          type: 'refresh'
        },
        config.jwt.secret,
        { expiresIn: refreshTokenExpiry }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return user data without password
      const userObject = user.toJSON();
      
      return {
        user: userObject,
        accessToken,
        refreshToken,
        expiresIn: rememberMe ? 7 * 24 * 60 * 60 : 3600 // 7 days or 1 hour in seconds
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
        status: 'active',
        emailVerified: true
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

  // Refresh access token
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role,
          fleetId: user.fleetId,
          type: 'access'
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return { accessToken };
    } catch (error) {
      throw error;
    }
  }

  // Google OAuth login/register
  static async googleAuth(googleUser) {
    try {
      // Generate tokens
      const accessToken = jwt.sign(
        { 
          id: googleUser.id, 
          email: googleUser.email,
          role: googleUser.role,
          fleetId: googleUser.fleetId,
          type: 'access'
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const refreshToken = jwt.sign(
        { 
          id: googleUser.id, 
          email: googleUser.email,
          type: 'refresh'
        },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      // Update last login
      await User.update(googleUser.id, { lastLogin: new Date().toISOString() });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = googleUser;
      
      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService;