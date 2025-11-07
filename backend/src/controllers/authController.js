import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../middleware/validation.js';
import passport from '../config/passport.js';

export class AuthController {
  // POST /api/v1/auth/login
  static login = asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    try {
      const result = await AuthService.login(email, password, rememberMe);
      
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

  // POST /api/v1/auth/send-signup-otp
  static sendSignupOtp = asyncHandler(async (req, res) => {
    const { email, firstName } = req.body;
    
    if (!email || !firstName) {
      return res.status(400).json({
        success: false,
        error: 'Email and first name are required'
      });
    }

    try {
      const result = await AuthService.sendSignupOtp(email, firstName);
      
      res.json({
        success: true,
        data: result,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/v1/auth/verify-signup-otp
  static verifySignupOtp = asyncHandler(async (req, res) => {
    const { email, otp, firstName, lastName, password, role = 'fleet_manager' } = req.body;
    
    if (!email || !otp || !firstName || !lastName || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    try {
      const result = await AuthService.verifySignupOtp(email, otp, {
        firstName,
        lastName,
        password,
        role
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

  // POST /api/v1/auth/forgot-password
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    try {
      const result = await AuthService.requestPasswordReset(email);
      
      res.json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/v1/auth/reset-password
  static resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and password are required'
      });
    }

    try {
      const result = await AuthService.resetPassword(token, password);
      
      res.json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/v1/auth/refresh-token
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    try {
      const result = await AuthService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: result,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/v1/auth/google
  static googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
  });

  // GET /api/v1/auth/google/callback
  static googleCallback = asyncHandler(async (req, res) => {
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_error`);
      }

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
      }

      try {
        const result = await AuthService.googleAuth(user);
        
        // Redirect to frontend with tokens (in production, use more secure method)
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('Google auth error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
    })(req, res);
  });
}

export default AuthController;