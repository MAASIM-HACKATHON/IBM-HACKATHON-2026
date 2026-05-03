# IBM-HACKATHON-2026

## Project Name and Short Description

### Smart Email Composer

Smart Email Composer is an AI-powered web application that helps users turn rough notes, drafts, and message ideas into polished professional emails. It is built for IBM Hackathon 2026 and uses IBM watsonx.ai Granite models to support smarter email generation and content analysis.

## Demo Video Link

- Demo video: [Google Drive Demo](https://drive.google.com/file/d/1qMitvU-Bm0beTXbNXQv02YXDDXxI8WtH/view?usp=sharing)

## Quick-Start / Run Instructions

### Prerequisites

- Node.js
- Python

### Recommended Startup

The root startup scripts install missing dependencies and launch all local services:

#### Windows

```powershell
.\start-windows.bat
```

#### macOS / Linux

```bash
chmod +x start-mac.sh
./start-mac.sh
```

### Services Started

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`
- Python Parser: `http://localhost:8000`

### Environment Notes

Before running locally, make sure your project environment files are configured with valid local values:

- `client/.env`
- `client/.env.local`
- `server/.env`
- `server/python-parser/.env`

### Manual Run Option

If you prefer to start each service yourself, use separate terminals:

```bash
# Terminal 1: Client
cd client
npm install
npm run dev

# Terminal 2: Server
cd server
npm install
npm run dev

# Terminal 3: Python Parser
cd server/python-parser
python -m venv venv
source venv/bin/activate  # Windows PowerShell: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Additional IBM Cloud Services Used

- IBM watsonx.ai for AI-powered generation and analysis
- No other IBM Cloud services are currently configured in this repository

## License and Attribution

- No standalone `LICENSE` file is currently included in this repository
- Built for IBM Hackathon 2026 using React, Vite, Next.js, FastAPI, Prisma, MySQL, and IBM watsonx.ai

## Additional Documentation

- [Smart Email Composer docs](01-documentations/smart-email-documentations/SMART_EMAIL_COMPOSER.md)
- [Quick start guide](01-documentations/smart-email-documentations/QUICK_START_EMAIL_COMPOSER.md)
- [Project summary](01-documentations/smart-email-documentations/PROJECT_SUMMARY.md)
