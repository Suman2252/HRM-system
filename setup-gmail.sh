#!/bin/bash

echo "🔧 Gmail Setup for HRM System Email Delivery"
echo "============================================="
echo ""

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "Creating .env file..."
    cat > server/.env << EOF
# Gmail Configuration for Real Email Delivery
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=HRM System <your-email@gmail.com>
CLIENT_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/hrm_system

# JWT Configuration
JWT_SECRET=your-secret-key

# Server Configuration
PORT=5001
EOF
    echo "✅ Created .env file with template"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📧 NEXT STEPS TO RECEIVE EMAILS IN YOUR GMAIL:"
echo ""
echo "1. Get Gmail App Password:"
echo "   - Go to https://myaccount.google.com/"
echo "   - Click Security → 2-Step Verification"
echo "   - Scroll down to 'App passwords'"
echo "   - Generate password for 'Mail'"
echo ""
echo "2. Edit server/.env file and replace:"
echo "   EMAIL_USER=your-email@gmail.com"
echo "   EMAIL_PASS=your-16-character-app-password"
echo ""
echo "   With your actual Gmail credentials"
echo ""
echo "3. Restart the server:"
echo "   cd server && npm start"
echo ""
echo "4. Test by creating a new employee!"
echo ""
echo "🎯 Current email system uses Ethereal (test service)"
echo "   After Gmail setup, emails will go to your real inbox!"
