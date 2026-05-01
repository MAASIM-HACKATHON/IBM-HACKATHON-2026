# ⚡ Quick Start Guide

## 🎯 Get Your Backend Running in 5 Minutes

### Step 1: Verify Prerequisites ✅
- [ ] XAMPP installed and MySQL running
- [ ] Database `db_ibmbob_hackathon_system` created in MySQL Workbench
- [ ] Node.js installed (v18 or higher)

### Step 2: Install Database Driver 📦
Choose one option:

**Option A: Prisma (Recommended for beginners)**
```bash
cd server
npm install prisma @prisma/client
npx prisma init
```

**Option B: MySQL2 (For raw SQL queries)**
```bash
cd server
npm install mysql2 dotenv
```

### Step 3: Generate Secure Secrets 🔐
Run this command **twice** to generate two different secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Open `server/.env` and replace:
- `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production` with first generated secret
- `SESSION_SECRET=your-session-secret-change-this-in-production` with second generated secret

### Step 4: Test Database Connection 🗄️
Create `server/test-db.js`:
```javascript
require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Database connected!');
    await conn.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}
test();
```

Run: `node test-db.js`

### Step 5: Create Your First API Endpoint 🚀
Create `server/src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'IBM Hackathon Backend is running!',
    timestamp: new Date().toISOString(),
    database: process.env.DB_NAME
  });
}
```

### Step 6: Update Port Configuration ⚙️
Edit `server/package.json` to use port 3001:
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

### Step 7: Start Development Server 🎉
```bash
npm run dev
```

You should see:
```
▲ Next.js 16.2.4
- Local:        http://localhost:3001
- Ready in 2.5s
```

### Step 8: Test Your API 🧪
Open your browser or use curl:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "IBM Hackathon Backend is running!",
  "timestamp": "2026-05-02T...",
  "database": "db_ibmbob_hackathon_system"
}
```

## 🎊 Success! Your Backend is Running!

## 📝 What's Next?

### 1. Set Up Database Schema
If using Prisma, edit `prisma/schema.prisma`:
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run migration:
```bash
npx prisma migrate dev --name init
```

### 2. Create More API Endpoints
Example: `src/app/api/users/route.ts`
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  // Fetch users from database
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Create user in database
  return NextResponse.json({ message: 'User created', data: body });
}
```

### 3. Install Additional Packages
```bash
# Authentication
npm install bcryptjs jsonwebtoken
npm install @types/bcryptjs @types/jsonwebtoken -D

# Validation
npm install zod

# CORS
npm install cors
npm install @types/cors -D
```

### 4. Connect Frontend
In your frontend (`client` folder), create an API service:

**File:** `client/src/services/api.ts`
```typescript
const API_URL = 'http://localhost:3001/api';

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`);
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// Usage
const health = await api.get('/health');
```

## 🔧 Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run linter |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Create new migration |
| `npx prisma generate` | Generate Prisma client |

## 📚 Documentation Files

- **QUICK_START.md** - This file (fastest way to get started)
- **SETUP_SUMMARY.md** - Complete setup overview
- **ENV_SETUP_GUIDE.md** - Detailed environment configuration
- **DATABASE_CONFIG.md** - Database setup and troubleshooting

## 🆘 Troubleshooting

### Server won't start
```bash
# Kill process on port 3001
npx kill-port 3001
# Or use a different port
npm run dev -- -p 3002
```

### Database connection fails
1. Check XAMPP - MySQL must be running (green)
2. Verify database exists: `SHOW DATABASES;` in MySQL Workbench
3. Check `.env` credentials match your MySQL setup

### "Cannot find module"
```bash
npm install
```

### TypeScript errors
```bash
npm install --save-dev @types/node @types/react
```

## 💡 Pro Tips

1. **Use Prisma Studio** for easy database management:
   ```bash
   npx prisma studio
   ```

2. **Enable hot reload** - Already configured! Just save files and see changes instantly.

3. **Use TypeScript** - Already set up! Get autocomplete and type safety.

4. **API Testing** - Use Thunder Client (VS Code extension) or Postman

5. **Database GUI** - Use MySQL Workbench or Prisma Studio

## 🎓 Learning Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## ✨ You're All Set!

Your Next.js backend is configured and running. Start building your API endpoints and connect them to your React frontend!

**Happy Coding! 🚀**

---

**Questions?** Check the other documentation files or create an issue in your repository.
