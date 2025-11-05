import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../middleware/validation.js';

export class AuthController {
  // POST /api/v1/auth/login
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    try {
      const result = await AuthService.login(email, password);
      
      res.json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/v1/auth/register
  static register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, role = 'fleet_manager', fleetId } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, and last name are required'
      });
    }

    try {
      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role,
        fleetId
      });
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/v1/auth/me
  static getCurrentUser = asyncHandler(async (req, res) => {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/v1/auth/profile
  static updateProfile = asyncHandler(async (req, res) => {
    try {
      const user = await AuthService.updateProfile(req.user.id, req.body);
      
      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/v1/auth/change-password
  static changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    try {
      const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/v1/auth/logout
  static logout = asyncHandler(async (req, res) => {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // In a more complex system, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
}

export default AuthController;