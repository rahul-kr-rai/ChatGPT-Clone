# 🤖 AI ChatBot & Job-Hunt Portal — MERN Stack + Agentic AI

A powerful, multimodal AI chatbot and autonomous job application platform built using the **MERN Stack** (MongoDB, Express, React, Node.js). This project leverages Google's **Gemini generative AI** models to deliver a ChatGPT-like conversational experience with persistent history, secure authentication, and a fully autonomous **Agentic Job-Hunt Mode** that evaluates resumes, searches live job boards, auto-generates cover letters, and submits applications — all on your behalf.

---

## ✨ Features

### 💬 AI Chat Engine
- AI-powered responses using **Google Gemini** (multi-model failover: 3.5 Flash → 2.5 Flash → 2.0 Flash)
- **Multimodal inputs**: text, images, PDFs, Word documents (`.docx`), and plain text files
- Rich **Markdown rendering** with syntax-highlighted code blocks and copy-to-clipboard
- **Voice input** via Web Speech API (hands-free dictation)
- **Abort generation** mid-response with instant cancel
- Persistent conversation history stored per-user in MongoDB

### 🔐 Authentication & Security
- Email/password signup & login with **bcrypt** password hashing
- **Google OAuth 2.0** one-click sign-in
- **JWT-based sessions** (7-day token expiry)
- **Password reset** via email (Nodemailer SMTP)
- **Rate limiting** on all endpoints (`express-rate-limit`)

### 💼 Agentic Job-Hunt Mode (Autonomous AI Pipeline)
- **ATS Resume Evaluator**: Upload your resume → get an instant ATS score (0-100), missing keywords, content & formatting suggestions
- **Autonomous Job Search**: Searches live job boards (JSearch / Adzuna APIs) with automatic Gemini AI fallback
- **Auto Cover Letter Generation**: AI-crafted tailored cover letters for each matched position
- **Auto-Apply Pipeline**: Submits applications and logs everything to MongoDB
- **Duplicate Detection**: Prevents re-applying to the same company
- **AI Email Parser**: Paste company response emails → auto-extract status (interviewing, rejected, etc.) and update your tracker
- **Candidate Inbox**: Gmail-style split-pane email viewer with star, read/unread, and delete actions
- **Applied Jobs Tracker**: Searchable, filterable table with status management and cover letter previews
- **Analytics Dashboard**: Visual statistics filtered by date range and company
- **Real Email Notifications**: Sends branded HTML confirmation emails to your actual inbox via Nodemailer

### 🎨 UI & Experience
- **Dark / Light theme** toggle (persisted in localStorage)
- **Responsive design** with mobile hamburger sidebar
- **Guided onboarding tour** for new users (separate flows for guests vs. authenticated users)
- **SweetAlert2** rich dialog confirmations
- **CSS animations** and glassmorphism effects

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
| --- | --- |
| **React** v19.2.x | UI framework |
| **Vite** v7.2.x | Build tool & dev server (HMR) |
| **Vanilla CSS** (84 KB+) | Theming, animations, responsive layouts |
| `@google/genai` v1.34.x | Gemini AI client |
| `@react-oauth/google` v0.13.x | Google OAuth frontend |
| `react-markdown` + `remark-gfm` | Markdown rendering (tables, code, lists) |
| `react-syntax-highlighter` v16.x | Prism-based code highlighting |
| `lucide-react` + `react-icons` | Icon libraries |
| `sweetalert2` v11.26.x | Rich dialog alerts |
| **ESLint** v9.39.x | Code quality |

### Backend
| Technology | Purpose |
| --- | --- |
| **Node.js** 18+ | Runtime |
| **Express** v5.2.x | Web framework |
| **MongoDB** + **Mongoose** v9.0.x | Database & ODM |
| `@google/generative-ai` v0.24.x | Gemini AI (multi-model failover) |
| `jsonwebtoken` v9.0.x | JWT authentication |
| `google-auth-library` v10.5.x | Google OAuth verification |
| `bcryptjs` v3.0.x | Password hashing |
| `multer` v2.0.x | File upload handling |
| `mammoth` v1.12.x | Word document (.docx) parsing |
| `nodemailer` v7.0.x | SMTP email (Gmail) |
| `express-rate-limit` v8.5.x | API rate limiting |
| `cors` v2.8.x | Cross-origin resource sharing |
| `dotenv` v17.2.x | Environment variable config |

### Deployment & APIs
| Service | Purpose |
| --- | --- |
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Cloud database |
| **JSearch** (RapidAPI) | Live job listings |
| **Adzuna API** | Live job listings (fallback) |
| **Gmail SMTP** | Email delivery |

---

## 📂 Repository Structure

```
ChatGPT-Clone/
├── backend/                          # Express API server
│   ├── server.js                     # Main server & all API routes (990 lines)
│   ├── db.js                         # MongoDB connection setup
│   ├── .env                          # Environment variables
│   ├── middleware/
│   │   └── auth.js                   # JWT auth middleware
│   └── models/
│       ├── User.js                   # User schema
│       ├── Conversation.js           # Chat thread schema
│       ├── Resume.js                 # ATS evaluation schema
│       └── JobApplication.js         # Job application tracking schema
│
├── frontend/                         # React + Vite client app
│   ├── src/
│   │   ├── App.jsx                   # Main React application (2,672 lines)
│   │   ├── App.css                   # Full CSS design system (84 KB+)
│   │   ├── index.css                 # Global base styles
│   │   ├── main.jsx                  # React DOM entry + Google OAuth provider
│   │   └── assets/                   # Static assets
│   ├── public/                       # Public static files
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite configuration
│   ├── vercel.json                   # Vercel deployment config
│   └── eslint.config.js              # ESLint configuration
│
├── README.md                         # This file
├── INSTALLATION.md                   # Detailed setup instructions
├── API.md                            # Full API documentation
├── CONTRIBUTING.md                   # Contribution guidelines
├── report.md                         # Detailed project report
└── test.md                           # Testing documentation
```

---

## ⚙️ Prerequisites

- **Node.js** 18+ (with npm)
- **MongoDB** (local instance or MongoDB Atlas)
- **Google Cloud** credentials (Gemini API key, OAuth Client ID)
- *(Optional)* RapidAPI key for JSearch, Adzuna API credentials

---

## 🚀 Installation

1. **Clone the repo:**
```bash
git clone https://github.com/rahul-kr-rai/ChatGPT-Clone.git
cd ChatGPT-Clone
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `GEMINI_API_KEY` | ✅ | Google Generative AI API key |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `EMAIL_USER` | Optional | Gmail address for SMTP |
| `EMAIL_PASS` | Optional | Gmail app password for SMTP |
| `CLIENT_URL` | Optional | Frontend URL for CORS |
| `PORT` | Optional | Server port (default: 10000) |
| `RAPIDAPI_KEY` | Optional | RapidAPI key for JSearch job search |
| `ADZUNA_APP_ID` | Optional | Adzuna API app ID |
| `ADZUNA_APP_KEY` | Optional | Adzuna API app key |
| `ADZUNA_COUNTRY` | Optional | Adzuna country code (default: `us`) |

Example `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/chatboat
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
EMAIL_USER=youremail@example.com
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:5173
PORT=10000
RAPIDAPI_KEY=your_rapidapi_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
ADZUNA_COUNTRY=us
```

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | Optional | Google OAuth client ID |
| `VITE_API_BASE_URL` | Optional | Backend base URL (default: `http://localhost:10000`) |

Example `frontend/.env`:
```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
VITE_API_BASE_URL=http://localhost:10000
```

---

## ▶️ Running (Development)

1. **Start the backend** (from `/backend`):
```bash
npm start
# Runs: node server.js (default port: 10000)
```

2. **Start the frontend** (from `/frontend`):
```bash
npm run dev
# Runs Vite dev server (default: http://localhost:5173)
```

Open `http://localhost:5173` in your browser.

---

## 🏗️ Build & Production

**Build Frontend:**
```bash
cd frontend
npm run build
# Creates optimized build in dist/ directory
```

**Run Backend in Production:**
```bash
cd backend
NODE_ENV=production npm start
```

**Lint Frontend:**
```bash
cd frontend
npm run lint
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/google-login` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Chat & Conversations
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/chat` | Send message or file to AI (multipart/form-data) |
| GET | `/api/conversations` | List all user conversations |
| GET | `/api/conversations/:id` | Get specific conversation |
| DELETE | `/api/conversations/:id` | Delete a conversation |

### Resume & Job Hunt
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/resume/evaluate` | Upload & evaluate resume (ATS score) |
| POST | `/api/resume/auto-apply` | Trigger autonomous job search & apply |
| GET | `/api/resume/history` | Get resume & application history |
| POST | `/api/applications` | Manually add a job application |
| PATCH | `/api/applications/:id/status` | Update application status |
| POST | `/api/applications/parse-email` | AI-parse company email & update status |

> **Note:** All endpoints (except auth) require `Authorization: Bearer <token>` header.

---

## 🔧 Troubleshooting

| Issue | Solution |
| --- | --- |
| Server exits with `JWT_SECRET` error | Add `JWT_SECRET` to `backend/.env` |
| MongoDB connection fails | Verify `MONGO_URI` and Atlas IP whitelist |
| AI features disabled | Set `GEMINI_API_KEY` in `backend/.env` |
| CORS errors | Set `CLIENT_URL` in `backend/.env` or update `allowedOrigins` in `server.js` |
| Job search returns simulated results | Add `RAPIDAPI_KEY` or `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` for live listings |
| Email sending fails | Verify `EMAIL_USER` and `EMAIL_PASS` (use Gmail App Password) |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## 📬 Connect With Us

- 📩 [Email](mailto:rahulkumarrai2711@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/rahulkumarraivgu/)
- 🌐 [GitHub](https://github.com/rahul-kr-rai)

---

**Happy coding! ❤️ We're excited to see what you build with AI ChatBot & Job-Hunt Portal.** 🚀
