# 🗄️ Database Configuration Reference

## Current Database Setup

**Database Name:** `db_ibmbob_hackathon_system`  
**Location:** XAMPP MySQL (localhost)  
**Port:** 3306  
**User:** root  
**Password:** (empty)

## Connection String

```env
DATABASE_URL="mysql://root:@localhost:3306/db_ibmbob_hackathon_system"
```

## Quick Verification Checklist

- [ ] XAMPP MySQL is running (green in XAMPP Control Panel)
- [ ] Database `db_ibmbob_hackathon_system` exists in MySQL Workbench
- [ ] `.env` file is created in server folder
- [ ] Database credentials in `.env` match your MySQL setup

## MySQL Workbench Quick Commands

### Check if database exists:
```sql
SHOW DATABASES LIKE 'db_ibmbob_hackathon_system';
```

### Create database (if not exists):
```sql
CREATE DATABASE IF NOT EXISTS db_ibmbob_hackathon_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Use the database:
```sql
USE db_ibmbob_hackathon_system;
```

### Show all tables:
```sql
SHOW TABLES;
```

### Check database size:
```sql
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'db_ibmbob_hackathon_system'
GROUP BY table_schema;
```

## Connection Test Script

Create `test-connection.js` in the server folder:

```javascript
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Database: ${process.env.DB_NAME}\n`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT DATABASE() as db');
    console.log(`📊 Connected to database: ${rows[0].db}`);
    
    await connection.end();
    console.log('🔌 Connection closed.');
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure MySQL is running in XAMPP');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Tip: Check your database credentials in .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Tip: Database does not exist. Create it in MySQL Workbench');
    }
  }
}

testConnection();
```

**Run the test:**
```bash
npm install mysql2 dotenv
node test-connection.js
```

## Prisma Setup (Alternative)

If you prefer using Prisma ORM:

### 1. Install Prisma:
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma:
```bash
npx prisma init
```

### 3. Update `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Example model
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. Create and run migrations:
```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client:
```bash
npx prisma generate
```

### 6. Use in your code:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example usage
const users = await prisma.user.findMany();
```

## Environment Variables for Database

```env
# Full connection string (used by Prisma)
DATABASE_URL="mysql://root:@localhost:3306/db_ibmbob_hackathon_system"

# Individual variables (used by mysql2)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_ibmbob_hackathon_system
```

## Common Database Operations

### Create a connection pool (mysql2):
```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
```

### Execute a query:
```typescript
import pool from '@/lib/db';

const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

## Troubleshooting

### MySQL not starting in XAMPP
1. Check if port 3306 is already in use
2. Try changing MySQL port in XAMPP config
3. Check XAMPP error logs

### Cannot connect to database
1. Verify MySQL is running (XAMPP Control Panel)
2. Check credentials in `.env`
3. Ensure database exists
4. Check firewall settings

### Character encoding issues
Use UTF-8 encoding:
```sql
ALTER DATABASE db_ibmbob_hackathon_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use strong passwords** in production
3. **Limit database user permissions** - Don't use root in production
4. **Use prepared statements** - Prevent SQL injection
5. **Enable SSL** for production database connections
6. **Regular backups** - Schedule automated backups

## Backup Commands

### Backup database:
```bash
mysqldump -u root -p db_ibmbob_hackathon_system > backup.sql
```

### Restore database:
```bash
mysql -u root -p db_ibmbob_hackathon_system < backup.sql
```

## Next Steps

1. ✅ Verify database connection
2. ⬜ Choose ORM (Prisma recommended) or raw SQL (mysql2)
3. ⬜ Design database schema
4. ⬜ Create migration files
5. ⬜ Set up database models
6. ⬜ Create API endpoints
7. ⬜ Test CRUD operations

---

**Need Help?** Check `ENV_SETUP_GUIDE.md` for detailed environment setup instructions.
