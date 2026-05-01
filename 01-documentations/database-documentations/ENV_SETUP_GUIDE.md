# Environment Variables Setup Guide

This guide explains how to configure the `.env` file for the IBM Hackathon 2026 backend server.

## 📋 Prerequisites

- XAMPP installed with MySQL running
- MySQL Workbench (optional, for database management)
- Database `db_ibmbob_hackathon_system` created in MySQL

## 🚀 Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the database credentials** in `.env` file based on your XAMPP MySQL setup

3. **Generate secure secrets** for JWT and session (see Security section below)

## 🗄️ Database Configuration

### For XAMPP Default Setup:
```env
DATABASE_URL="mysql://root:@localhost:3306/db_ibmbob_hackathon_system"
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_ibmbob_hackathon_system
```

### If you have a MySQL password:
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/db_ibmbob_hackathon_system"
DB_PASSWORD=your_password
```

### For custom MySQL port (if not using default 3306):
```env
DB_PORT=3307
DATABASE_URL="mysql://root:@localhost:3307/db_ibmbob_hackathon_system"
```

## 🔐 Security Configuration

### Generate JWT Secret:
Run this command in your terminal to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and replace `your-super-secret-jwt-key-change-this-in-production` in your `.env` file.

### Generate Session Secret:
Run the same command again for a different secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 Application Configuration

### Development Mode:
```env
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production Mode:
```env
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=https://your-production-domain.com
```

## 🔗 CORS Configuration

Update these based on your frontend URL:
```env
NEXT_PUBLIC_CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

If your Vite frontend runs on a different port, update accordingly.

## 📧 Email Configuration (Optional)

For Gmail SMTP:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update the `.env` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
EMAIL_FROM=noreply@ibmhackathon.com
```

## 📁 File Upload Configuration

```env
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./public/uploads
```

Adjust `MAX_FILE_SIZE` based on your requirements:
- 5MB = 5242880
- 10MB = 10485760
- 50MB = 52428800

## 🛡️ Rate Limiting

Protect your API from abuse:
```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # Max 100 requests per window
```

## 🔍 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Full MySQL connection string | - | ✅ |
| `DB_HOST` | MySQL host | localhost | ✅ |
| `DB_PORT` | MySQL port | 3306 | ✅ |
| `DB_USER` | MySQL username | root | ✅ |
| `DB_PASSWORD` | MySQL password | (empty) | ✅ |
| `DB_NAME` | Database name | db_ibmbob_hackathon_system | ✅ |
| `NODE_ENV` | Environment mode | development | ✅ |
| `PORT` | Server port | 3001 | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:3001 | ✅ |
| `NEXT_PUBLIC_CLIENT_URL` | Frontend URL | http://localhost:5173 | ✅ |
| `ALLOWED_ORIGINS` | CORS allowed origins | - | ✅ |
| `SMTP_HOST` | Email SMTP host | - | ❌ |
| `SMTP_PORT` | Email SMTP port | 587 | ❌ |
| `SMTP_USER` | Email username | - | ❌ |
| `SMTP_PASSWORD` | Email password | - | ❌ |
| `LOG_LEVEL` | Logging level | debug | ❌ |

## ✅ Verify Your Setup

1. **Check if MySQL is running:**
   - Open XAMPP Control Panel
   - Ensure MySQL is started (green indicator)

2. **Verify database exists:**
   ```sql
   SHOW DATABASES LIKE 'db_ibmbob_hackathon_system';
   ```

3. **Test connection:**
   Create a test file `test-db.js` in the server folder:
   ```javascript
   require('dotenv').config();
   const mysql = require('mysql2/promise');

   async function testConnection() {
     try {
       const connection = await mysql.createConnection({
         host: process.env.DB_HOST,
         port: process.env.DB_PORT,
         user: process.env.DB_USER,
         password: process.env.DB_PASSWORD,
         database: process.env.DB_NAME
       });
       console.log('✅ Database connection successful!');
       await connection.end();
     } catch (error) {
       console.error('❌ Database connection failed:', error.message);
     }
   }

   testConnection();
   ```

   Run: `node test-db.js`

## 🚨 Important Security Notes

1. **Never commit `.env` to version control** - It's already in `.gitignore`
2. **Use different secrets for development and production**
3. **Rotate secrets regularly in production**
4. **Use environment-specific `.env` files:**
   - `.env.development`
   - `.env.production`
   - `.env.test`

## 🆘 Troubleshooting

### "Access denied for user 'root'@'localhost'"
- Check if MySQL password is set in XAMPP
- Update `DB_PASSWORD` in `.env`

### "Unknown database 'db_ibmbob_hackathon_system'"
- Create the database in MySQL Workbench:
  ```sql
  CREATE DATABASE db_ibmbob_hackathon_system;
  ```

### "ECONNREFUSED 127.0.0.1:3306"
- Ensure MySQL is running in XAMPP
- Check if port 3306 is correct (might be 3307 in some setups)

### "Cannot find module 'dotenv'"
- Install dotenv: `npm install dotenv`

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [MySQL Connection Strings](https://www.connectionstrings.com/mysql/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
