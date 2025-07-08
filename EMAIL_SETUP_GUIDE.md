# 📧 Email Setup Guide for HRM System

## 🔍 Current Issue
You're not receiving emails because the system is using **Ethereal Email** (test service) instead of real Gmail SMTP.

## ✅ What's Working
- ✅ Employee creation is successful
- ✅ Auto-generated passwords are created
- ✅ Email sending function is working
- ✅ Database is storing all data correctly

## 📧 Email Status for Indra Kumar
- **Employee**: Indra Kumar (EMP002)
- **Email**: indra22052002@gmail.com
- **Status**: Email sent to test inbox (not real Gmail)
- **Preview URL**: https://ethereal.email/message/aGteehUEKDDG3de9aGtkzNmj0lJfuuonAAAAAxFEm1O385H6x-m9qb6aLfQ

## 🛠️ How to Fix (Receive Real Emails)

### Step 1: Get Gmail App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left panel
3. Enable **2-Step Verification** if not already enabled
4. Under "2-Step Verification", click **App passwords**
5. Select **Mail** and generate a 16-character password
6. Copy this password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Edit Configuration
Open the file: `/server/.env`

Replace these lines:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

With your actual credentials:
```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

### Step 3: Restart Server
```bash
cd /Users/gokulben/Downloads/HRM-system-main/server
npm start
```

### Step 4: Test Email
Create a new employee and the email will be sent to the real Gmail address.

## 🎯 Quick Test
You can view the current test email here:
**Preview URL**: https://ethereal.email/message/aGteehUEKDDG3de9aGtkzNmj0lJfuuonAAAAAxFEm1O385H6x-m9qb6aLfQ

This shows exactly what the email looks like and confirms the system is working!

## 📋 Employee Credentials (For Testing)
- **Email**: indra22052002@gmail.com
- **Password**: Auto-generated (check the preview URL above)
- **Login**: http://localhost:3000

## ✨ System Status
- 🟢 **Database**: Connected and working
- 🟢 **Server**: Running on port 5001
- 🟢 **Client**: Running on port 3000
- 🟢 **Employee Creation**: Working perfectly
- 🟡 **Email**: Working (test mode) - needs Gmail config for real emails
