const nodemailer = require('nodemailer');

class RealEmailService {
  constructor() {
    this.transporters = [];
    this.isInitialized = false;
  }

  async initializeTransporters() {
    if (this.isInitialized) return;

    // Method 1: Gmail SMTP (if configured)
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        const gmailTransporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST || 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        this.transporters.push({ name: 'Gmail', transporter: gmailTransporter });
        console.log('✅ Gmail transporter configured');
      } catch (error) {
        console.log('❌ Gmail transporter failed:', error.message);
      }
    }

    // Method 2: Ethereal Email (test service that works)
    try {
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      this.transporters.push({ name: 'Ethereal', transporter: etherealTransporter });
      console.log('✅ Ethereal transporter configured');
    } catch (error) {
      console.log('❌ Ethereal transporter failed:', error.message);
    }

    this.isInitialized = true;
    console.log(`📧 Total email transporters configured: ${this.transporters.length}`);
  }

  async sendEmailWithFallback(mailOptions) {
    let lastError = null;

    for (const { name, transporter } of this.transporters) {
      try {
        console.log(`📧 Attempting to send email via ${name}...`);
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent successfully via ${name}!`);
        console.log(`📧 Message ID: ${info.messageId}`);
        
        return {
          success: true,
          provider: name,
          messageId: info.messageId,
          previewUrl: nodemailer.getTestMessageUrl(info)
        };
      } catch (error) {
        console.log(`❌ ${name} failed: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    // If all transporters fail, return error
    return {
      success: false,
      error: `All email providers failed. Last error: ${lastError?.message}`,
      attemptedProviders: this.transporters.map(t => t.name)
    };
  }

  async sendWelcomeEmail(employeeData, generatedPassword) {
    // Initialize transporters if not already done
    await this.initializeTransporters();
    
    const loginUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'HRM System <noreply@hrmsystem.com>',
      to: employeeData.email,
      subject: '🎉 Welcome to HRM System - Your Login Credentials',
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
            .credentials-box { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; }
            .credential-item { background-color: rgba(255,255,255,0.1); padding: 12px; margin: 10px 0; border-radius: 6px; }
            .credential-value { font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 1px; }
            .login-button { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to HRM System</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey with us begins now!</p>
            </div>
            
            <div class="content">
              <p><strong>Hello ${employeeData.firstName} ${employeeData.lastName},</strong></p>
              
              <p>Congratulations! Your employee account has been created successfully.</p>
              
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                <h3 style="color: #4f46e5; margin: 0 0 15px 0;">📋 Your Employee Information</h3>
                <p><strong>Employee ID:</strong> ${employeeData.employeeId}</p>
                <p><strong>Department:</strong> ${employeeData.department}</p>
                <p><strong>Designation:</strong> ${employeeData.designation}</p>
                <p><strong>Email:</strong> ${employeeData.email}</p>
              </div>
              
              <div class="credentials-box">
                <h3>🔐 Your Login Credentials</h3>
                <div class="credential-item">
                  <div>Email (Username)</div>
                  <div class="credential-value">${employeeData.email}</div>
                </div>
                <div class="credential-item">
                  <div>Temporary Password</div>
                  <div class="credential-value">${generatedPassword}</div>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${loginUrl}/login" class="login-button">🚀 Login to HRM System</a>
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: #92400e; margin: 0 0 10px 0;">🔒 Important Security Information</h4>
                <ul>
                  <li>You will be required to change your password on first login</li>
                  <li>Keep your credentials secure and confidential</li>
                  <li>Contact IT support if you need assistance</li>
                </ul>
              </div>
              
              <p>We're excited to have you join our team!</p>
              
              <p><strong>Best regards,</strong><br>
              <strong>HRM System Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await this.sendEmailWithFallback(mailOptions);
  }
}

module.exports = new RealEmailService();
