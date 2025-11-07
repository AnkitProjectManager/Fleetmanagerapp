import crypto from 'crypto';

class OtpService {
  constructor() {
    // In-memory storage for OTPs (in production, use Redis or database)
    this.otpStore = new Map();
    this.maxAttempts = 3;
    this.otpLength = 6;
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes in milliseconds
  }

  generateOtp() {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateSecureToken() {
    // Generate a secure token for password reset
    return crypto.randomBytes(32).toString('hex');
  }

  async storeOtp(email, otp, type = 'registration') {
    const key = `${email}:${type}`;
    const otpData = {
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.otpExpiry,
      attempts: 0,
      verified: false
    };

    this.otpStore.set(key, otpData);
    
    // Clean up expired OTPs
    this.cleanupExpiredOtps();
    
    return otp;
  }

  async verifyOtp(email, otp, type = 'registration') {
    const key = `${email}:${type}`;
    const otpData = this.otpStore.get(key);

    if (!otpData) {
      throw new Error('OTP not found or expired');
    }

    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(key);
      throw new Error('OTP has expired');
    }

    if (otpData.attempts >= this.maxAttempts) {
      this.otpStore.delete(key);
      throw new Error('Maximum verification attempts exceeded');
    }

    if (otpData.verified) {
      throw new Error('OTP already used');
    }

    otpData.attempts++;

    if (otpData.otp !== otp) {
      this.otpStore.set(key, otpData);
      throw new Error('Invalid OTP');
    }

    // Mark as verified
    otpData.verified = true;
    this.otpStore.set(key, otpData);

    return true;
  }

  async resendOtp(email, type = 'registration') {
    const key = `${email}:${type}`;
    const existingOtp = this.otpStore.get(key);

    // Check if we can resend (not too frequent)
    if (existingOtp && (Date.now() - existingOtp.createdAt) < 60000) { // 1 minute cooldown
      throw new Error('Please wait before requesting a new OTP');
    }

    // Generate new OTP
    const newOtp = this.generateOtp();
    await this.storeOtp(email, newOtp, type);
    
    return newOtp;
  }

  async invalidateOtp(email, type = 'registration') {
    const key = `${email}:${type}`;
    this.otpStore.delete(key);
  }

  cleanupExpiredOtps() {
    const now = Date.now();
    for (const [key, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(key);
      }
    }
  }

  // Password reset token management
  async storePasswordResetToken(email, token) {
    const key = `reset:${email}`;
    const tokenData = {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
      used: false
    };

    this.otpStore.set(key, tokenData);
    return token;
  }

  async verifyPasswordResetToken(token) {
    // Find the token in our store
    for (const [key, tokenData] of this.otpStore.entries()) {
      if (key.startsWith('reset:') && tokenData.token === token) {
        if (Date.now() > tokenData.expiresAt) {
          this.otpStore.delete(key);
          throw new Error('Reset token has expired');
        }

        if (tokenData.used) {
          throw new Error('Reset token already used');
        }

        // Extract email from key
        const email = key.replace('reset:', '');
        return { email, valid: true };
      }
    }

    throw new Error('Invalid or expired reset token');
  }

  async invalidatePasswordResetToken(email) {
    const key = `reset:${email}`;
    const tokenData = this.otpStore.get(key);
    if (tokenData) {
      tokenData.used = true;
      this.otpStore.set(key, tokenData);
    }
  }
}

export default new OtpService();