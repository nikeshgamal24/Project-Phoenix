const nodemailer = require("nodemailer");
const { AppError } = require("../../middleware/errorHandler");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  /**
   * Send email
   */
  async sendMail({ to, subject, text, html }) {
    try {
      if (!this.transporter) {
        throw new AppError('Email service not configured', 500);
      }

      const mailOptions = {
        from: {
          name: "Project Phoenix",
          address: process.env.NODEMAILER_USER,
        },
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email, otp, userName = '') {
    const subject = "Password Reset OTP - Project Phoenix";
    const text = `Dear ${userName},\n\nYour password reset OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nProject Phoenix Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">Project Phoenix</h1>
        </div>
        
        <h2 style="color: #34495e;">Password Reset Request</h2>
        <p>Dear ${userName},</p>
        <p>You requested to reset your password for Project Phoenix.</p>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px; border: 2px dashed #3498db;">
          <h3 style="margin: 0; color: #2c3e50;">Your OTP Code</h3>
          <h2 style="font-size: 32px; letter-spacing: 8px; color: #3498db; margin: 10px 0;">${otp}</h2>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> This OTP will expire in 5 minutes.</p>
        </div>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
          This is an automated message from Project Phoenix - Academic Project Management System<br>
          Please do not reply to this email.
        </p>
      </div>
    `;

    return await this.sendMail({ to: email, subject, text, html });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, userName, role) {
    const subject = "Welcome to Project Phoenix!";
    const text = `Welcome ${userName}! Your ${role} account has been created successfully.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Welcome to Project Phoenix!</h1>
        <p>Dear ${userName},</p>
        <p>Your ${role} account has been created successfully.</p>
        <p>You can now log in and start using the platform.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Project Phoenix - Academic Project Management System</p>
      </div>
    `;

    return await this.sendMail({ to: email, subject, text, html });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(email, title, message, userName = '') {
    const subject = `${title} - Project Phoenix`;
    const text = `Dear ${userName},\n\n${message}\n\nBest regards,\nProject Phoenix Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Project Phoenix</h1>
        <h2 style="color: #34495e;">${title}</h2>
        <p>Dear ${userName},</p>
        <p>${message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Project Phoenix - Academic Project Management System</p>
      </div>
    `;

    return await this.sendMail({ to: email, subject, text, html });
  }
}

module.exports = new EmailService();
