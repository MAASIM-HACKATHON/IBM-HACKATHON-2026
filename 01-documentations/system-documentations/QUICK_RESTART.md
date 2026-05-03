# Quick Restart Instructions

## You're Almost There! 🎯

The AI parser is working, we just need to fix how we read the response.

## Step 1: Stop Your Server

In the terminal where your services are running, press:
```
Ctrl + C
```

Wait for all services to stop.

## Step 2: Restart with Rebuild

Run this command:
```bash
./restart-with-rebuild.sh
```

This will:
1. Stop any remaining processes
2. Clean the build cache
3. Rebuild with the new code
4. Start all services

## Step 3: Upload Resume Again

Go to your app and upload the same resume.

## Step 4: Check Server Logs

Look for these new log messages:
```
✅ Watsonx response received
Response structure: { ... }
✓ Found text at: [some path]
Generated text length: [number]
Generated text preview: { "personal_info": ...
```

## What to Share

If it still doesn't work, copy and paste these specific lines from the server logs:
1. The "Response structure" line
2. The "Found text at" line (or error if not found)
3. The "Generated text preview" line

This will tell us exactly how to fix it!

---

## Alternative: Manual Restart

If the script doesn't work:

```bash
# Stop services
lsof -ti:8000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Clean and rebuild server
cd server
rm -rf .next
npm run build

# Start Python parser
cd python-parser
./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
cd ..

# Start server (watch the logs!)
npm run dev &
cd ..

# Start client
cd client
npm run dev &
```

---

**We're very close to fixing this! Just need to restart and see the response structure.**
