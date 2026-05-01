# Quick Start Guide - Smart Email Composer

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache and MySQL

2. **Create Database**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create new database: `db_ibmbob_hackathon_system`
   - Or run SQL:
   ```sql
   CREATE DATABASE db_ibmbob_hackathon_system;
   ```

### Step 2: Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name add_email_tables

# Start the server
npm run dev
```

Server will be running at: **http://localhost:3001**

### Step 3: Client Setup

Open a new terminal:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

Client will be running at: **http://localhost:5173**

### Step 4: Test the Application

1. Open browser: `http://localhost:5173`
2. You should see the Smart Email Composer interface
3. Try generating an email:
   - Enter: "need meeting tomorrow about project"
   - Select tone: "Formal"
   - Click "Generate Professional Email"

## ✅ Verification Checklist

- [ ] MySQL is running in XAMPP
- [ ] Database `db_ibmbob_hackathon_system` exists
- [ ] Server is running on port 3001
- [ ] Client is running on port 5173
- [ ] No CORS errors in browser console
- [ ] Email generation works

## 🔧 Environment Files

### Server `.env` (already configured)
```env
DATABASE_URL="mysql://root:Admin123!@localhost:3306/db_ibmbob_hackathon_system"
PORT=3001
NEXT_PUBLIC_CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Client `.env` (already created)
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Smart Email Composer
```

## 🎯 Quick Test Commands

### Test Server API
```bash
# Test email generation endpoint
curl -X POST http://localhost:3001/api/email/generate \
  -H "Content-Type: application/json" \
  -d '{
    "originalText": "need meeting tomorrow",
    "tone": "formal",
    "action": "generate"
  }'
```

### Check Database
```bash
# Navigate to server directory
cd server

# Open Prisma Studio (Database GUI)
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can view your database tables.

## 📱 Using the Application

### 1. Generate Email
- **Input**: "need meeting tomorrow about project"
- **Tone**: Formal
- **Output**: Professional email with greeting, body, and closing

### 2. Shorten Email
- Click "Shorten" to make the email more concise
- Keeps key points while reducing word count

### 3. Expand Email
- Click "Expand" to add more details
- Makes the email more comprehensive

### 4. Fix Grammar
- Click "Fix Grammar" to correct any errors
- Improves sentence structure and punctuation

### 5. Generate Subject
- Click "Generate Subject" to create a subject line
- Based on email content analysis

### 6. Toggle Theme
- Click sun/moon icon in header
- Switch between light and dark mode
- Preference is saved automatically

## 🎨 Features to Try

1. **Different Tones**
   - Try the same message with different tones
   - Compare formal vs. casual outputs

2. **Complex Messages**
   - Test with longer, more detailed messages
   - See how AI structures the content

3. **Editing**
   - Generate an email
   - Edit it manually
   - Use "Fix Grammar" to polish

4. **Copy to Clipboard**
   - Generate an email
   - Click copy button
   - Paste into your email client

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill the process if needed
taskkill /PID <process_id> /F

# Or change port in server/.env
PORT=3002
```

### Client won't start
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Vite will automatically use next available port
```

### Database connection error
1. Ensure MySQL is running in XAMPP
2. Check database name in `.env`
3. Verify credentials (username/password)
4. Test connection:
```bash
cd server
npx prisma db pull
```

### CORS errors
1. Check `ALLOWED_ORIGINS` in server `.env`
2. Ensure client URL matches
3. Restart server after changing `.env`

### Prisma errors
```bash
# Regenerate Prisma Client
cd server
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name
```

## 📚 Next Steps

1. **Read Full Documentation**: `01-documentations/SMART_EMAIL_COMPOSER.md`
2. **Explore API**: Test all endpoints with Postman
3. **Customize**: Modify tones and templates in `server/src/services/aiService.ts`
4. **Add Features**: Implement user authentication, history, etc.

## 🔗 Important URLs

- **Client**: http://localhost:5173
- **Server**: http://localhost:3001
- **API Base**: http://localhost:3001/api
- **Prisma Studio**: http://localhost:5555 (when running)
- **phpMyAdmin**: http://localhost/phpmyadmin

## 💡 Tips

1. **Keep both terminals open** - One for server, one for client
2. **Check browser console** - For any frontend errors
3. **Check server terminal** - For API errors
4. **Use Prisma Studio** - To inspect database records
5. **Test API first** - Before testing frontend

## 🎉 You're Ready!

Your Smart Email Composer is now running. Start transforming rough messages into professional emails!

---

**Need Help?**
- Check the full documentation
- Review error messages carefully
- Ensure all prerequisites are met
- Verify environment variables
