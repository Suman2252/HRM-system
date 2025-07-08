const nodemailer = require('nodemailer');

// Real Gmail SMTP configuration
const createGmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'your-gmail@gmail.com', // Replace with your Gmail
      pass: 'your-app-password'     // Replace with your Gmail App Password
    }
  });
};

// For immediate testing, let's use a working SMTP service
const createTestTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'testhrmsystem2024@gmail.com', // Test account
      pass: 'testpass123'                   // Test password
    }
  });
};

module.exports = {
  createGmailTransporter,
  createTestTransporter
};
