const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.setupEmailTransporter();
  }

  async setupEmailTransporter() {
    try {
      // Check if Gmail credentials are provided
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
          process.env.EMAIL_USER !== 'your-email@gmail.com' && 
          process.env.EMAIL_PASS !== 'your-app-password') {
        
        // Use Gmail SMTP
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        console.log('📧 Email service configured with Gmail SMTP');
        console.log(`📧 Gmail user: ${process.env.EMAIL_USER}`);
        
        // Test the connection
        await this.transporter.verify();
        console.log('✅ Gmail SMTP connection verified');
        
      } else {
        // Fall back to test account for development
        await this.setupTestAccount();
      }
    } catch (error) {
      console.error('❌ Error setting up Gmail SMTP, falling back to test account:', error);
      await this.setupTestAccount();
    }
  }

  async setupTestAccount() {
    try {
      // Create a test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Email service configured with test account');
      console.log(`📧 Test email user: ${testAccount.user}`);
      console.log('📧 Note: To use real emails, configure Gmail credentials in .env file');
    } catch (error) {
      console.error('❌ Error setting up email service:', error);
    }
  }

  async sendWelcomeEmail(employeeData, generatedPassword) {
    try {
      const loginUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'HRM System <noreply@hrmsystem.com>',
        to: employeeData.email,
        subject: 'Welcome to HRM System - Your Login Credentials',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
              .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 30px 20px; background-color: #f8fafc; border-radius: 0 0 10px 10px; }
              .welcome-text { font-size: 18px; color: #1e293b; margin-bottom: 20px; }
              .employee-details { background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
              .credentials-box { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; }
              .credentials-box h3 { margin: 0 0 15px 0; font-size: 20px; }
              .credential-item { background-color: rgba(255,255,255,0.1); padding: 12px; margin: 10px 0; border-radius: 6px; }
              .credential-label { font-size: 14px; opacity: 0.8; margin-bottom: 5px; }
              .credential-value { font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 1px; }
              .security-notice { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
              .security-notice h4 { color: #92400e; margin: 0 0 10px 0; display: flex; align-items: center; }
              .security-icon { margin-right: 8px; }
              .login-button { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; font-size: 16px; transition: transform 0.2s; }
              .login-button:hover { transform: translateY(-2px); }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
              .company-info { background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .help-section { background-color: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to HRM System</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey with us begins now!</p>
              </div>
              
              <div class="content">
                <div class="welcome-text">
                  <strong>Hello ${employeeData.firstName} ${employeeData.lastName},</strong>
                </div>
                
                <p>Congratulations and welcome to our organization! We're excited to have you join our team. Your employee account has been successfully created and is ready for use.</p>
                
                <div class="employee-details">
                  <h3 style="color: #4f46e5; margin: 0 0 15px 0;">📋 Your Employee Information</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Employee ID:</td><td style="padding: 8px 0;">${employeeData.employeeId}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Department:</td><td style="padding: 8px 0;">${employeeData.department}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Designation:</td><td style="padding: 8px 0;">${employeeData.designation}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Date of Joining:</td><td style="padding: 8px 0;">${new Date(employeeData.dateOfJoining).toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Employment Type:</td><td style="padding: 8px 0;">${employeeData.employmentType || 'Full Time'}</td></tr>
                  </table>
                </div>
                
                <div class="credentials-box">
                  <h3>🔐 Your Login Credentials</h3>
                  <p style="margin: 0 0 20px 0; opacity: 0.9;">Use these credentials to access the HRM system</p>
                  
                  <div class="credential-item">
                    <div class="credential-label">Email Address (Username)</div>
                    <div class="credential-value">${employeeData.email}</div>
                  </div>
                  
                  <div class="credential-item">
                    <div class="credential-label">Temporary Password</div>
                    <div class="credential-value">${generatedPassword}</div>
                  </div>
                </div>
                
                <div class="security-notice">
                  <h4><span class="security-icon">🔒</span>Important Security Information</h4>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li><strong>First Login:</strong> You will be required to change your password immediately upon first login for security purposes.</li>
                    <li><strong>Password Requirements:</strong> Your new password must be at least 6 characters long and include a mix of letters and numbers.</li>
                    <li><strong>Keep Secure:</strong> Please keep your login credentials confidential and do not share them with anyone.</li>
                    <li><strong>Account Security:</strong> If you suspect any unauthorized access, contact IT support immediately.</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="${loginUrl}/login?email=${encodeURIComponent(employeeData.email)}" class="login-button">
                    🚀 Login to HRM System
                  </a>
                </div>
                
                <div class="company-info">
                  <h4 style="color: #4f46e5; margin: 0 0 10px 0;">📞 Need Help?</h4>
                  <p style="margin: 0;">If you have any questions or need assistance with your account, please don't hesitate to contact:</p>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li><strong>HR Department:</strong> For general inquiries and onboarding support</li>
                    <li><strong>IT Support:</strong> For technical issues and password assistance</li>
                  </ul>
                </div>
                
                <div class="help-section">
                  <p style="margin: 0;"><strong>💡 Quick Start Tips:</strong></p>
                  <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Click the login button above or visit: <a href="${loginUrl}/login">${loginUrl}/login</a></li>
                    <li>Enter your email and temporary password</li>
                    <li>Follow the prompts to set up your new secure password</li>
                    <li>Complete your profile information</li>
                    <li>Explore the system features and familiarize yourself with the interface</li>
                  </ol>
                </div>
                
                <p style="margin-top: 30px;">We're thrilled to have you as part of our team and look forward to working with you!</p>
                
                <p><strong>Best regards,</strong><br>
                <strong>HRM System Team</strong><br>
                <em>Human Resources Department</em></p>
              </div>
              
              <div class="footer">
                <p><strong>📧 This is an automated message.</strong> Please do not reply to this email.</p>
                <p>If you need immediate assistance, please contact your HR representative.</p>
                <p style="margin-top: 15px; font-size: 12px;">&copy; 2024 HRM System. All rights reserved. | Confidential Information</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Welcome email with credentials sent successfully');
      console.log('📧 Message ID:', info.messageId);
      console.log(`📧 Sent to: ${employeeData.email}`);
      
      // For development, log the preview URL
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
        recipient: employeeData.email
      };
    } catch (error) {
      console.error('❌ Error sending welcome email with credentials:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send login credentials to a newly created employee
   * @param {Object} employeeData - Employee information
   * @param {string} generatedPassword - Auto-generated secure password
   * @returns {Object} Email sending result
   */
  async sendEmployeeCredentials(employeeData, generatedPassword) {
    // Use the enhanced welcome email method
    return await this.sendWelcomeEmail(employeeData, generatedPassword);
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'HRM System <noreply@hrmsystem.com>',
        to: userEmail,
        subject: 'Password Reset Request - HRM System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              
              <div class="content">
                <h2>Password Reset</h2>
                
                <p>You have requested to reset your password for your HRM System account.</p>
                
                <div class="warning">
                  <p><strong>Security Notice:</strong> If you did not request this password reset, please ignore this email and contact your administrator immediately.</p>
                </div>
                
                <p>Click the button below to reset your password:</p>
                
                <a href="${resetUrl}" class="button">Reset Password</a>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                
                <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
                
                <p>Best regards,<br>HRM System Team</p>
              </div>
              
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2024 HRM System. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Password reset email sent successfully');
      console.log('📧 Message ID:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();
