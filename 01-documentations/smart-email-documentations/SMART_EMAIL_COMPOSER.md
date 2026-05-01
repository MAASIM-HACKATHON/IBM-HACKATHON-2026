# Smart Email Composer - Documentation

## Overview
The Smart Email Composer is an AI-powered web application that transforms rough messages into professional, well-structured emails. It helps users save time and communicate more effectively.

## Features

### 🎯 Core Features
1. **AI-Powered Email Generation**
   - Transform rough text into professional emails
   - Multiple tone options (formal, friendly, urgent, casual)
   - Intelligent content structuring

2. **Tone Selector**
   - **Formal**: Professional language with proper salutations
   - **Friendly**: Warm and approachable while maintaining professionalism
   - **Urgent**: Emphasizes time-sensitivity and importance
   - **Casual**: Relaxed, conversational tone

3. **Subject Line Generator**
   - Automatically creates compelling subject lines
   - Based on email content analysis
   - Concise and attention-grabbing

4. **Smart Editing Tools**
   - **Shorten**: Condense emails while keeping key points
   - **Expand**: Add more details and professional language
   - **Fix Grammar**: Correct grammar and improve writing

5. **UI/UX Features**
   - Light and Dark mode support
   - Clean, modern interface
   - Real-time word count
   - Copy to clipboard functionality
   - Responsive design

## Technology Stack

### Frontend (Client)
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Icons**: React Icons 5.5.0
- **State Management**: React Context API

### Backend (Server)
- **Framework**: Next.js 16.2.4
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **AI Service**: IBM Watson AI (configurable)

## Project Structure

```
IBM-HACKATHON-2026/
├── client/                          # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── system-components/
│   │   │       └── EmailComposer.tsx    # Main email composer component
│   │   ├── context/
│   │   │   └── ThemeContext.tsx         # Theme management (light/dark)
│   │   ├── hooks/
│   │   │   └── useEmailGenerator.ts     # Email generation hook
│   │   ├── services/
│   │   │   └── emailService.ts          # API communication
│   │   ├── pages/
│   │   │   └── system-page/
│   │   │       └── HomePage.tsx         # Main page
│   │   └── App.tsx                      # App entry with providers
│   └── .env                             # Environment variables
│
└── server/                          # Backend application
    ├── src/
    │   ├── app/api/email/
    │   │   ├── generate/route.ts        # Email generation endpoint
    │   │   ├── history/route.ts         # Email history endpoint
    │   │   └── [id]/route.ts            # Delete email endpoint
    │   ├── services/
    │   │   ├── aiService.ts             # AI processing logic
    │   │   └── emailService.ts          # Business logic
    │   ├── types/
    │   │   └── email.types.ts           # TypeScript types
    │   ├── lib/
    │   │   └── prisma.ts                # Database client
    │   └── middleware.ts                # CORS configuration
    ├── prisma/
    │   └── schema.prisma                # Database schema
    └── .env                             # Environment variables
```

## Database Schema

### Users Table
```prisma
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
  emails    Email[]
}
```

### Emails Table
```prisma
model Email {
  id              Int      @id @default(autoincrement())
  userId          Int?
  user            User?    @relation(fields: [userId], references: [id])
  originalText    String   @db.Text
  generatedEmail  String   @db.Text
  subject         String?
  tone            String   # formal, friendly, urgent, casual
  action          String   # generate, shorten, expand, fix_grammar
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## API Endpoints

### 1. Generate Email
**POST** `/api/email/generate`

Generate or process email content.

**Request Body:**
```json
{
  "originalText": "need meeting tomorrow about project",
  "tone": "formal",
  "action": "generate",
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generatedEmail": "Dear [Recipient],\n\nI hope this email finds you well...",
    "subject": "Meeting Request: Project Discussion",
    "originalText": "need meeting tomorrow about project",
    "tone": "formal",
    "action": "generate",
    "wordCount": {
      "original": 5,
      "generated": 45
    }
  }
}
```

**Actions:**
- `generate`: Create professional email from rough text
- `shorten`: Condense email content
- `expand`: Add more details
- `fix_grammar`: Correct grammar and improve writing
- `generate_subject`: Create subject line

**Tones:**
- `formal`: Professional and structured
- `friendly`: Warm and approachable
- `urgent`: Time-sensitive emphasis
- `casual`: Relaxed and conversational

### 2. Get Email History
**GET** `/api/email/history?userId=1&page=1&limit=10`

Retrieve user's email generation history.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "originalText": "need meeting tomorrow",
      "generatedEmail": "Dear [Recipient]...",
      "subject": "Meeting Request",
      "tone": "formal",
      "action": "generate",
      "createdAt": "2026-05-02T10:00:00Z",
      "updatedAt": "2026-05-02T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 3. Delete Email
**DELETE** `/api/email/:id?userId=1`

Delete email from history.

**Response:**
```json
{
  "success": true,
  "message": "Email deleted successfully"
}
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (via XAMPP or standalone)
- npm or yarn

### 1. Database Setup

1. Start MySQL server (XAMPP)
2. Create database:
```sql
CREATE DATABASE db_ibmbob_hackathon_system;
```

3. Configure environment variables in `server/.env`:
```env
DATABASE_URL="mysql://root:Admin123!@localhost:3306/db_ibmbob_hackathon_system"
```

4. Run migrations:
```bash
cd server
npx prisma migrate dev --name init_email_tables
npx prisma generate
```

### 2. Server Setup

```bash
cd server
npm install
npm run dev
```

Server will start at `http://localhost:3001`

### 3. Client Setup

```bash
cd client
npm install
npm run dev
```

Client will start at `http://localhost:5173`

### 4. Environment Configuration

**Client `.env`:**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Smart Email Composer
```

**Server `.env`:**
```env
# Database
DATABASE_URL="mysql://root:Admin123!@localhost:3306/db_ibmbob_hackathon_system"

# Server
NODE_ENV=development
PORT=3001

# CORS
NEXT_PUBLIC_CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# AI Configuration (Optional - for IBM Watson integration)
IBM_API_KEY=your-ibm-api-key-here
IBM_CLOUD_URL=https://us-south.ml.cloud.ibm.com
IBM_PROJECT_ID=your-project-id-here
```

## Usage Guide

### Basic Workflow

1. **Enter Your Message**
   - Type or paste your rough message in the left text area
   - No need to worry about grammar or structure

2. **Select Tone**
   - Choose from: Formal, Friendly, Urgent, or Casual
   - The tone affects the language and structure

3. **Generate Email**
   - Click "Generate Professional Email"
   - Wait for AI processing (usually 1-2 seconds)

4. **Review and Edit**
   - Generated email appears on the right
   - Subject line is automatically created
   - Edit directly in the text area if needed

5. **Use Smart Tools**
   - **Shorten**: Make the email more concise
   - **Expand**: Add more details and context
   - **Fix Grammar**: Correct any errors
   - **Generate Subject**: Create a new subject line

6. **Copy and Use**
   - Click the copy button to copy to clipboard
   - Paste into your email client

### Tips for Best Results

1. **Be Clear**: Even rough messages should convey the main point
2. **Include Key Details**: Names, dates, specific requests
3. **Choose Right Tone**: Match the tone to your recipient and situation
4. **Review Output**: Always review and personalize the generated email
5. **Use Smart Tools**: Iterate with shorten/expand for perfect length

## AI Service Integration

### Current Implementation
The application uses template-based generation with intelligent text processing. This provides:
- Fast response times
- No external API dependencies
- Consistent results
- Privacy (no data sent to third parties)

### IBM Watson Integration (Optional)

To integrate IBM Watson AI:

1. **Get IBM Cloud Credentials**
   - Sign up at [IBM Cloud](https://cloud.ibm.com)
   - Create Watson AI service
   - Get API key and project ID

2. **Update Environment Variables**
```env
IBM_API_KEY=your-actual-api-key
IBM_CLOUD_URL=https://us-south.ml.cloud.ibm.com
IBM_PROJECT_ID=your-project-id
```

3. **Update AI Service**
   - Modify `server/src/services/aiService.ts`
   - Implement IBM Watson API calls
   - Replace template-based generation

### Alternative AI Services

The architecture supports other AI services:
- OpenAI GPT
- Google Gemini
- Anthropic Claude
- Azure OpenAI

Simply update the `aiService.ts` file with your preferred provider.

## Theme System

### Light Mode
- Clean white background
- High contrast for readability
- Professional appearance

### Dark Mode
- Dark gray background (#1a1a1a)
- Reduced eye strain
- Modern aesthetic

### Implementation
```typescript
// Toggle theme
const { theme, toggleTheme } = useTheme();

// Theme persists in localStorage
// Respects system preference on first load
```

## Performance Optimization

1. **Lazy Loading**: Components load on demand
2. **Memoization**: Expensive calculations cached
3. **Debouncing**: Word count updates optimized
4. **Database Indexing**: Fast history queries
5. **Connection Pooling**: Efficient database connections

## Security Considerations

1. **Input Validation**: All inputs sanitized
2. **CORS Configuration**: Restricted origins
3. **Rate Limiting**: Prevent abuse (configurable)
4. **SQL Injection Protection**: Prisma ORM parameterized queries
5. **XSS Protection**: React automatic escaping

## Future Enhancements

### Planned Features
1. **User Authentication**: Login and personal history
2. **Email Templates**: Pre-built templates for common scenarios
3. **Multi-language Support**: Generate emails in different languages
4. **Email Scheduling**: Schedule emails for later
5. **Team Collaboration**: Share and review emails
6. **Analytics**: Track email performance
7. **Browser Extension**: Generate emails directly in Gmail/Outlook
8. **Mobile App**: iOS and Android applications

### AI Improvements
1. **Context Learning**: Learn from user preferences
2. **Recipient Analysis**: Adjust tone based on recipient
3. **Industry-Specific**: Templates for different industries
4. **Sentiment Analysis**: Ensure appropriate emotional tone
5. **Attachment Suggestions**: Recommend relevant attachments

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: Can't reach database server
```
**Solution**: Ensure MySQL is running in XAMPP

**2. CORS Error**
```
Access to fetch blocked by CORS policy
```
**Solution**: Check `ALLOWED_ORIGINS` in server `.env`

**3. Port Already in Use**
```
Error: Port 3001 is already in use
```
**Solution**: Kill the process or change port in `.env`

**4. Prisma Client Error**
```
Error: Prisma Client not generated
```
**Solution**: Run `npx prisma generate`

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
ENABLE_LOGGING=true
```

## Contributing

### Development Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Meaningful variable names

## License

[Your License Here]

## Support

For issues or questions:
- GitHub Issues: [Repository URL]
- Email: support@example.com
- Documentation: [Docs URL]

---

**Built with ❤️ for IBM Hackathon 2026**
