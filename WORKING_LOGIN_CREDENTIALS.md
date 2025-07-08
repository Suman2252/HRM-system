# 🔐 HRM SYSTEM - WORKING LOGIN CREDENTIALS

## 🌐 System Access URLs
- **Client Application**: http://localhost:3000
- **Server API**: http://localhost:5001
- **MongoDB Database**: `mongodb://localhost:27017/hrm_system`
- **MongoDB Compass**: Available for database management

---

## ✅ VERIFIED WORKING CREDENTIALS

### 🔴 ADMIN ACCOUNTS

#### Primary Admin (Ready to Use)
- **Email**: `admin@hrm.com`
- **Password**: `admin123`
- **Role**: Admin
- **Status**: ✅ WORKING - Direct login
- **Access**: Full system access, employee management, all features

#### Secondary Admin (First Login Required)
- **Email**: `newadmin@hrm.com`
- **Password**: `admin123` (temporary)
- **Role**: Admin
- **Status**: ⚠️ REQUIRES PASSWORD CHANGE on first login
- **Access**: Full system access after password change

---

### 🟡 HR MANAGER ACCOUNTS

#### Primary HR Manager (First Login Required)
- **Email**: `hr@hrm.com`
- **Password**: `hr123456` (temporary)
- **Role**: HR Manager
- **Status**: ⚠️ REQUIRES PASSWORD CHANGE on first login
- **Access**: Employee management, HR functions

#### Secondary HR Manager (First Login Required)
- **Email**: `newhr@hrm.com`
- **Password**: `hr123456` (temporary)
- **Role**: HR Manager
- **Status**: ⚠️ REQUIRES PASSWORD CHANGE on first login
- **Access**: Employee management, HR functions

---

### 🟢 EMPLOYEE ACCOUNTS

#### Employee 1 (First Login Required)
- **Email**: `sumanrio99@gmail.com`
- **Password**: `123456` (temporary)
- **Role**: Employee
- **Name**: Joshwa Raj
- **Employee ID**: EMP123
- **Department**: Engineering
- **Designation**: DEVELOPER
- **Status**: ⚠️ REQUIRES PASSWORD CHANGE on first login

#### Employee 2 (First Login Required)
- **Email**: `indra22052002@gmail.com`
- **Password**: `123456` (temporary)
- **Role**: Employee
- **Status**: ⚠️ REQUIRES PASSWORD CHANGE on first login

#### Employee 3 (First Login Required)
- **Email**: `m.suman2205@gmail.com`
- **Password**: `123456` (temporary)
- **Role**: Employee
- **Status**: ⚠️ REQUIRES PASSWORD CHANGE on first login

#### Employee 4 (First Login Required)
- **Email**: `sumanrio27@gmail.com`
- **Password**: `123456` (temporary)
- **Role**: Employee
- **Status**: ⚠️ REQUIRES PASSWORD CHANGE on first login

#### Employee 5 (First Login Required)
- **Email**: `testadmin@hrm.com`
- **Password**: `123456` (temporary)
- **Role**: Employee
- **Status**: ⚠️ REQUIRES PASSWORD CHANGE on first login

---

## 🚀 QUICK START GUIDE

### For Immediate Testing (No Password Change Required):
```
Email: admin@hrm.com
Password: admin123
```

### For Role-Based Testing:
1. **Admin Access**: Use `admin@hrm.com` / `admin123`
2. **HR Manager Access**: Use `hr@hrm.com` / `hr123456` (will prompt for password change)
3. **Employee Access**: Use `sumanrio99@gmail.com` / `123456` (will prompt for password change)

---

## 📋 AUTHENTICATION FLOW

### Direct Login (Admin Only):
- Login with credentials → Access dashboard immediately

### First Login (HR & Employees):
- Login with temporary password → System prompts for password change → Set new password → Access dashboard

---

## 🔧 SYSTEM FEATURES VERIFIED

✅ **Authentication System**
- JWT token-based authentication
- Role-based access control
- Password change enforcement for first login
- Secure password hashing with bcrypt

✅ **User Management**
- Admin: Full system access
- HR Manager: Employee management, HR functions
- Employee: Personal information, leave requests

✅ **Database Integration**
- MongoDB connection established
- Real-time data persistence
- User and employee collections populated

✅ **Frontend Features**
- Login/logout functionality
- Dashboard with role-specific content
- Employee management interface
- Leave management system
- Profile management

---

## 🛠️ TROUBLESHOOTING

### If Login Fails:
1. Ensure both client (port 3000) and server (port 5001) are running
2. Check MongoDB connection
3. Use exact credentials as listed above
4. For first-time users, complete password change process

### Password Reset:
- Admin users can reset passwords through the employee management interface
- Database scripts available in `server/scripts/` directory

---

## 📊 DATABASE STATISTICS
- **Total Users**: 9
- **Admin Users**: 3
- **HR Manager Users**: 2
- **Employee Users**: 4
- **Database**: MongoDB (hrm_system)
- **Collections**: Users, Employees

---

**Last Updated**: January 7, 2025
**System Status**: ✅ FULLY OPERATIONAL
