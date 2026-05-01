# 🗄️ Database Migration Guide

## ✅ What's Been Set Up

1. ✅ Prisma 6 installed
2. ✅ Prisma schema created with Users table
3. ✅ `.env` file configured with database credentials
4. ✅ SESSION_SECRET generated

## 📋 Next Steps - Run These Commands

### Step 1: Generate Prisma Client
Open your terminal in the `server` folder and run:
```bash
npx prisma generate
```

This will generate the Prisma Client based on your schema.

### Step 2: Create the Migration
Run this command to create the migration files:
```bash
npx prisma migrate dev --name init_users_table
```

This will:
- Create a migration file in `prisma/migrations/`
- Apply the migration to your database
- Create the `users` table in `db_ibmbob_hackathon_system`

### Step 3: Verify in MySQL Workbench
After running the migration, open MySQL Workbench and run:
```sql
USE db_ibmbob_hackathon_system;
SHOW TABLES;
DESCRIBE users;
```

You should see the `users` table with these columns:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `email` (VARCHAR, UNIQUE)
- `username` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `firstName` (VARCHAR, NULLABLE)
- `lastName` (VARCHAR, NULLABLE)
- `role` (VARCHAR, DEFAULT 'user')
- `isActive` (BOOLEAN, DEFAULT true)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

## 🚀 Start the Development Server

After the migration is successful, start your Next.js server:
```bash
npm run dev
```

But first, update `package.json` to use port 3001:
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "eslint"
  }
}
```

## 🧪 Test the Database Connection

Create a test API endpoint to verify database connectivity.

### Create: `src/app/api/test-db/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Count users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connected successfully!',
      database: process.env.DB_NAME,
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
```

### Test the endpoint:
```bash
curl http://localhost:3001/api/test-db
```

Or open in browser: `http://localhost:3001/api/test-db`

## 📝 Create a Test User

### Create: `src/app/api/users/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
        // password is excluded for security
      }
    });
    
    return NextResponse.json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}

// POST create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password, firstName, lastName, role } = body;
    
    // Basic validation
    if (!email || !username || !password) {
      return NextResponse.json({
        status: 'error',
        message: 'Email, username, and password are required'
      }, { status: 400 });
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password, // In production, hash this with bcrypt!
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || 'user'
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'User created successfully',
      data: user
    }, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json({
        status: 'error',
        message: 'Email or username already exists'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}
```

### Test creating a user:
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "user"
  }'
```

### Test getting all users:
```bash
curl http://localhost:3001/api/users
```

## 🔍 Verify in MySQL Workbench

After creating a user, check in MySQL Workbench:
```sql
USE db_ibmbob_hackathon_system;
SELECT * FROM users;
```

You should see your test user!

## 🛠️ Useful Prisma Commands

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Create and apply migration |
| `npx prisma migrate reset` | Reset database and reapply migrations |
| `npx prisma studio` | Open Prisma Studio (GUI for database) |
| `npx prisma db push` | Push schema changes without migration |
| `npx prisma db pull` | Pull schema from database |
| `npx prisma format` | Format schema file |

## 🎨 Open Prisma Studio

Prisma Studio is a visual database editor:
```bash
npx prisma studio
```

This will open `http://localhost:5555` where you can:
- View all tables
- Add/edit/delete records
- Run queries visually

## 📚 Your Prisma Schema

Located at: `server/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  password  String
  firstName String?
  lastName  String?
  role      String   @default("user")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## 🔐 Security Note

⚠️ **IMPORTANT**: The example code stores passwords in plain text. In production, you MUST:

1. Install bcrypt:
```bash
npm install bcryptjs
npm install @types/bcryptjs -D
```

2. Hash passwords before storing:
```typescript
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);
```

3. Compare passwords during login:
```typescript
const isValid = await bcrypt.compare(inputPassword, user.password);
```

## 🆘 Troubleshooting

### Error: "Can't reach database server"
- Check if MySQL is running in XAMPP
- Verify DATABASE_URL in `.env`
- Check if port 3306 is correct

### Error: "Unknown database"
- Create the database in MySQL Workbench:
  ```sql
  CREATE DATABASE db_ibmbob_hackathon_system;
  ```

### Error: "Access denied"
- Check DB_PASSWORD in `.env`
- Verify MySQL credentials

### Migration fails
- Delete `prisma/migrations` folder
- Run `npx prisma migrate dev --name init` again

## ✅ Success Checklist

- [ ] Prisma 6 installed
- [ ] Schema file created
- [ ] Migration run successfully
- [ ] Users table visible in MySQL Workbench
- [ ] Test API endpoint created
- [ ] Server running on port 3001
- [ ] Can create users via API
- [ ] Can view users in MySQL Workbench

## 🎉 You're Ready!

Once all steps are complete, your database is fully set up and you can start building your IBM Hackathon application!

---

**Need Help?** Check the other documentation files or refer to [Prisma Documentation](https://www.prisma.io/docs)
