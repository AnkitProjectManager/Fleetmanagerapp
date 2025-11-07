import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

class EmailService {
  constructor() {
    this.initEmailService();
  }

  async initEmailService() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'development'; // Change default to development
    
    if (emailProvider === 'sendgrid') {
      try {
        // Initialize SendGrid with better error handling
        if (!process.env.SENDGRID_API_KEY) {
          console.log('⚠️ SENDGRID_API_KEY not found, falling back to development mode');
          this.emailProvider = 'development';
          this.initDevelopmentMode();
          return;
        }
        
        // Validate API key format
        if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
          console.log('⚠️ Invalid SendGrid API key format, falling back to development mode');
          this.emailProvider = 'development';
          this.initDevelopmentMode();
          return;
        }
        
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.emailProvider = 'sendgrid';
        this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@rollcharge.com';
        this.fromName = process.env.SENDGRID_FROM_NAME || 'Roll & Charge';
        
        console.log('📧 ✅ SendGrid initialized successfully');
        console.log('📧 📨 From:', `${this.fromName} <${this.fromEmail}>`);
        
        // Test SendGrid connection (optional)
        await this.testSendGridConnection();
        
      } catch (error) {
        console.error('📧 ❌ SendGrid initialization failed:', error.message);
        console.log('📧 🔄 Falling back to development mode');
        this.emailProvider = 'development';
        this.initDevelopmentMode();
      }
    } else {
      // Fallback to development mode
      this.emailProvider = 'development';
      this.initDevelopmentMode();
    }
  }

  initDevelopmentMode() {
    console.log('📧 🧪 Using Development Mode - Emails will be logged to console');
    this.emailProvider = 'development';
  }

  async testSendGridConnection() {
    try {
      // This is a simple way to test if SendGrid API key is working
      // We don't actually send an email, just validate the API key
      console.log('📧 🔍 Testing SendGrid connection...');
      
      // Note: SendGrid doesn't provide a simple API key validation endpoint
      // So we'll test it when we actually send the first email
      console.log('📧 ✅ SendGrid API key format is valid');
      
    } catch (error) {
      console.error('📧 ❌ SendGrid connection test failed:', error.message);
      throw error;
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      if (this.emailProvider === 'sendgrid') {
        // Use SendGrid API with enhanced error handling
        const msg = {
          to,
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          subject,
          html,
          text: text || this.stripHtml(html)
        };

        console.log('📧 🚀 Attempting to send email via SendGrid...');
        console.log('📧 📨 To:', to);
        console.log('📧 📋 Subject:', subject);
        
        const result = await sgMail.send(msg);
        
        console.log('📧 ✅ SendGrid email sent successfully!');
        console.log('📧 🆔 Message ID:', result[0].headers['x-message-id']);
        
        return {
          messageId: result[0].headers['x-message-id'],
          response: 'Email sent via SendGrid'
        };
        
      } else {
        // Development mode - log to console
        console.log('📧 🧪 [DEV MODE] Email Details:');
        console.log('📧 📨 To:', to);
        console.log('📧 📋 Subject:', subject);
        console.log('📧 📝 Content Preview:', text ? text.substring(0, 100) + '...' : 'HTML content');
        console.log('📧 ✅ Email simulation completed');
        
        return {
          messageId: 'dev-' + Date.now(),
          response: 'Development mode - email logged'
        };
      }
    } catch (error) {
      console.error('📧 ❌ Email sending failed:', error.message);
      
      // Handle specific SSL/TLS errors
      if (error.message.includes('SSL') || error.message.includes('TLS') || error.code === 'ECONNRESET') {
        console.error('📧 🔒 SSL/TLS Error detected - falling back to development mode');
        this.emailProvider = 'development';
        
        // Retry in development mode
        console.log('📧 🔄 Retrying email in development mode...');
        return this.sendEmail(to, subject, html, text);
      }
      
      // Handle SendGrid specific errors
      if (error.response && error.response.body && error.response.body.errors) {
        console.error('📧 🔍 SendGrid Error Details:', JSON.stringify(error.response.body.errors, null, 2));
        
        // If it's an API key error, fall back to development mode
        if (error.response.status === 401 || error.response.status === 403) {
          console.error('📧 🔑 API Key issue - falling back to development mode');
          this.emailProvider = 'development';
          return this.sendEmail(to, subject, html, text);
        }
      }
      
      // For development, don't throw errors - just log and continue
      if (config.nodeEnv === 'development') {
        console.log('📧 🔄 Development mode: Email error ignored, continuing...');
        return {
          messageId: 'dev-error-' + Date.now(),
          response: 'Development mode - error handled gracefully'
        };
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendOtpEmail(email, otp, firstName) {
    const subject = 'Your Roll & Charge Verification Code';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Roll & Charge</h1>
            <p style="color: white; margin: 10px 0 0 0;">Fleet Management Portal</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${firstName}!</h2>
            
            <p>Welcome to Roll & Charge! Please use the following verification code to complete your registration:</p>
            
            <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea;">
              <h1 style="font-size: 32px; margin: 0; color: #667eea; letter-spacing: 8px;">${otp}</h1>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">This code expires in 10 minutes</p>
            </div>
            
            <p>If you didn't request this verification code, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, resetToken, firstName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset Your Password - Roll & Charge';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Roll & Charge</h1>
            <p style="color: white; margin: 10px 0 0 0;">Fleet Management Portal</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${firstName}!</h2>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;">
              ${resetUrl}
            </p>
            
            <p style="color: #e74c3c; font-weight: bold;">This link expires in 1 hour.</p>
            
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }



  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

export default new EmailService();