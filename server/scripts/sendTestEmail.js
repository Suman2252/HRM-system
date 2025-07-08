const nodemailer = require('nodemailer');

async function sendTestEmail() {
  try {
    // Create a test account for demonstration
    const testAccount = await nodemailer.createTestAccount();
    
    // Create a transporter using the test account
    const testTransporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const mailOptions = {
      from: 'HRM System <noreply@hrmsystem.com>',
      to: 'indra22052002@gmail.com',
      subject: 'Test Email from HRM System',
      html: `
        <h2>🎉 Test Email from HRM System</h2>
        <p>This is a test email to verify the email functionality.</p>
        <p>If you receive this, the email system is working!</p>
        <p><strong>Employee:</strong> Indra Kumar</p>
        <p><strong>Email:</strong> indra22052002@gmail.com</p>
        <p><strong>Generated Password:</strong> ABC123</p>
        <hr>
        <p><em>This is a test email from the HRM System.</em></p>
      `
    };

    console.log('📧 Attempting to send test email...');
    const info = await testTransporter.sendMail(mailOptions);
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
    
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Instructions for real Gmail setup
console.log(`
📧 EMAIL SETUP INSTRUCTIONS:
=============================

To receive real emails at indra22052002@gmail.com, you need to:

1. Get a Gmail App Password:
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Go to Security > App passwords
   - Generate an app password for "Mail"

2. Edit this file and replace:
   user: 'your-gmail@gmail.com'     // Your Gmail address
   pass: 'your-app-password'        // The 16-character app password

3. Or edit the .env file with:
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password

4. Restart the server

For now, running test email...
`);

sendTestEmail();
