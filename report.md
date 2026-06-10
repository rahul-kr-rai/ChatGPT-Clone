# 📊 Project Report: AI ChatBot & Agentic Job-Hunt Portal (MERN Stack)

This report outlines the capabilities, architecture, features, and technology stack of the **AI ChatBot & Job-Hunt Portal** project.

---

## 🚀 Project Overview

The project is a full-featured, responsive, and secure MERN stack web application that replicates and extends the ChatGPT experience. By integrating Google's Gemini generative AI models (with automatic multi-model failover), it provides conversational text, multimodal image/file interactions, hands-free voice inputs, persistent user histories, and a specialized **Agentic Job-Hunt Mode** with an autonomous resume evaluation, job search, and application pipeline.

---

## 🛠️ Technology Stack & Tools

The application leverages a modern, production-ready developer stack:

### Frontend

| Category | Technology | Version |
| --- | --- | --- |
| **UI Framework** | [React](file:///d:/Project/ChatGPT-Clone/frontend/package.json) | v19.2.x |
| **Build Tool** | [Vite](file:///d:/Project/ChatGPT-Clone/frontend/package.json) | v7.2.x |
| **Styling** | [Vanilla CSS](file:///d:/Project/ChatGPT-Clone/frontend/src/App.css) (84 KB+) | — |
| **AI Client** | `@google/genai` | v1.34.x |
| **Google OAuth** | `@react-oauth/google` | v0.13.x |
| **Markdown Rendering** | `react-markdown` + `remark-gfm` | v10.1.x / v4.0.x |
| **Code Highlighting** | `react-syntax-highlighter` (Prism, VSCode Dark+ theme) | v16.1.x |
| **Icons** | `lucide-react` + `react-icons` | v0.562.x / v5.5.x |
| **Dialogs & Alerts** | `sweetalert2` | v11.26.x |
| **Linting** | ESLint (v9.39.x) + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` | — |

### Backend

| Category | Technology | Version |
| --- | --- | --- |
| **Runtime** | Node.js | 18+ |
| **Web Framework** | [Express](file:///d:/Project/ChatGPT-Clone/backend/server.js) | v5.2.x |
| **Database** | MongoDB + [Mongoose ODM](file:///d:/Project/ChatGPT-Clone/backend/db.js) | v9.0.x |
| **Generative AI** | `@google/generative-ai` (Gemini 3.5 Flash → 2.5 Flash → 2.0 Flash failover) | v0.24.x |
| **Auth (JWT)** | `jsonwebtoken` | v9.0.x |
| **Auth (Google)** | `google-auth-library` (OAuth2Client) | v10.5.x |
| **Password Hashing** | `bcryptjs` | v3.0.x |
| **File Uploads** | `multer` (in-memory storage, 5 MB limit) | v2.0.x |
| **Word Doc Parsing** | `mammoth` | v1.12.x |
| **Email (SMTP)** | `nodemailer` (Gmail SMTP) | v7.0.x |
| **Rate Limiting** | `express-rate-limit` | v8.5.x |
| **Env Config** | `dotenv` | v17.2.x |
| **CORS** | `cors` | v2.8.x |

### Infrastructure & Deployment

| Concern | Tool |
| --- | --- |
| **Frontend Hosting** | Vercel ([vercel.json](file:///d:/Project/ChatGPT-Clone/frontend/vercel.json)) |
| **Backend Hosting** | Render / any Node.js host |
| **Database Hosting** | MongoDB Atlas |
| **Job Board APIs** | JSearch (RapidAPI), Adzuna API |
| **Version Control** | Git + GitHub |

---

## ✨ Key Capabilities & Abilities

### 1. Conversational AI Engine
- **Multimodal Prompting**: Users can input text questions or upload files (images, PDFs, Word docs `.docx`, or plain text `.txt`). Gemini processes file buffers to answer queries dynamically.
- **Word Document Support**: `.docx` files are parsed server-side using `mammoth` to extract raw text, enabling resume and document analysis without client-side conversion.
- **Developer Persona**: Enforces a custom AI personality system instruction naming the assistant "AI ChatBot" created by Rahul Kumar Rai.
- **Automatic Model Failover**: The backend cycles through multiple Gemini models (`gemini-3.5-flash` → `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-flash-latest`) with exponential backoff retries on transient errors (429/503), ensuring maximum uptime.
- **Real-time Streaming Simulation**: Features thinking loaders and the ability to abort responses instantly via `AbortController`.
- **Hands-Free Voice Input**: Uses the Web Speech API inside [App.jsx](file:///d:/Project/ChatGPT-Clone/frontend/src/App.jsx) to translate voice commands into text input.
- **Rich Markdown Output**: Bot responses are rendered with `react-markdown` + `remark-gfm`, supporting tables, code blocks (with syntax highlighting and copy-to-clipboard), lists, and links.

### 2. Multi-tenant Authentication & Security
- **Email Sign-up & Login**: User registration is secured by hashing passwords with `bcryptjs`.
- **Google OAuth 2.0**: Single click login using Google accounts via `@react-oauth/google` (frontend) and `google-auth-library` (backend verification).
- **Secure Sessions**: Authentication state is maintained using JWT tokens (7-day expiry) sent in the `Authorization: Bearer <token>` request header.
- **Password Reset**: Users can request a reset link which generates a short-lived JWT token and dispatches a recovery email via Nodemailer SMTP.
- **Rate Limiting**: `express-rate-limit` protects auth endpoints (30 requests/15 min) and general API endpoints (200 requests/15 min).

### 3. Persistent Conversation Logs
- User histories are persisted inside the [Conversation.js](file:///d:/Project/ChatGPT-Clone/backend/models/Conversation.js) Mongoose schema.
- Users can view a sidebar history, select past chats to resume them, or delete conversations securely.
- Auto-titled conversations based on the first message content.

### 4. Responsive UI & Theming
- **Dark / Light Mode Toggle**: Theme state persisted in `localStorage` with `data-theme` attribute on `<body>`.
- **Mobile-Responsive Sidebar**: Hamburger menu toggle for mobile viewports (≤768px) with slide-in chat sidebar.
- **Guided Onboarding Tour**: Step-by-step interactive tour for both authenticated users and guests, with DOM element highlighting and positional popovers.
- **Warning Cards**: Auto-dismissing notification cards for guest users encouraging sign-up.

### 5. Agentic AI Job Application System

The application includes a powerful, autonomous **Job-Hunt Mode** that enables a complete simulated and real-world recruitment workflow:

#### 5a. ATS Resume Evaluator
- Parses resume documents (PDF, Word `.docx`, text `.txt`) via multimodal Gemini prompts.
- Returns structured JSON: ATS score (0-100), extracted email, optimized job search query, skills list, missing keywords, content suggestions, and formatting suggestions.
- All evaluation results are persisted in MongoDB via the [Resume.js](file:///d:/Project/ChatGPT-Clone/backend/models/Resume.js) schema.
- **Conditional Branching**:
  - **ATS Score < 70**: Displays targeted improvement recommendations (layout, keywords, content).
  - **ATS Score ≥ 70**: Automatically triggers the autonomous job hunt pipeline.

#### 5b. Autonomous Job Search & Auto-Apply
- **Live Job Board Integration**: Queries real-world listings via JSearch (RapidAPI) or Adzuna API, with automatic fallback to Gemini AI simulation if API keys are missing or calls fail.
- **Auto Cover Letter Generation**: Gemini generates tailored, professional cover letters (max 250 words) for each matched position, customized with the candidate's skill set.
- **Duplicate Detection**: Checks MongoDB for existing applications to the same company (case-insensitive collation) to prevent duplicate submissions.
- **Application Logging**: All applications are tracked via [JobApplication.js](file:///d:/Project/ChatGPT-Clone/backend/models/JobApplication.js) with statuses: `applied`, `under review`, `interviewing`, `rejected`, `failed`.

#### 5c. Activity Terminal
- Displays live operation console logs on the frontend dashboard with timestamped agent actions.
- Shows real-time progress: initialization → parsing → scoring → job search → cover letter generation → submission.

#### 5d. Candidate Inbox Simulation
- Renders an interactive split-pane mail client layout where users can read confirmation emails.
- Supports email actions: star/unstar, mark read/unread, delete.
- Each email includes a rendered HTML confirmation card matching real company branding.

#### 5e. Applied Jobs Tracker
- Full-featured table view with search, status filtering, and expandable row details.
- Manual status updates via dropdown (`applied` → `under review` → `interviewing` → `rejected` → `failed`).
- Cover letter preview modal for each application.
- "Re-apply" / "Apply More" functionality to re-trigger the autonomous job search pipeline.

#### 5f. AI Email Parser
- Paste company response emails (acceptance, rejection, interview invite) into the parser.
- Gemini extracts the company name and classifies the outcome status automatically.
- Auto-matches against existing applications in MongoDB and updates statuses in real-time.

#### 5g. Email Confirmation
- **Nodemailer SMTP Integration**: Sends actual HTML confirmation emails to the candidate's personal email address (extracted from resume or user profile).
- Emails are branded per-company with styled templates including application summary details.

#### 5h. Analytics Dashboard
- Visual charts and statistics for application tracking.
- Filterable by date range (7/14/30 days or all) and company name.
- Tracks application status distribution, submission trends, and overall pipeline health.

---

## 🛠️ Tech Stack & Components Used for the Agentic Job-Hunt System

| Component | Technology Implemented | Why / How It Works |
| --- | --- | --- |
| **Frontend** | [React.js](file:///d:/Project/ChatGPT-Clone/frontend/src/App.jsx) + Vanilla CSS ([App.css](file:///d:/Project/ChatGPT-Clone/frontend/src/App.css)) | Lightweight UI with circular CSS gauges, interactive log terminals, split-pane inbox, and analytics charts. |
| **Backend** | [Node.js](file:///d:/Project/ChatGPT-Clone/backend/server.js) + [Express v5](file:///d:/Project/ChatGPT-Clone/backend/server.js) | Scalable backend hosting API routes, auth middleware, rate limiting, and processing resume upload buffers. |
| **Database** | [MongoDB](file:///d:/Project/ChatGPT-Clone/backend/db.js) + [Mongoose ODM v9](file:///d:/Project/ChatGPT-Clone/backend/models/Resume.js) | Structured schemas for [Resume.js](file:///d:/Project/ChatGPT-Clone/backend/models/Resume.js) and [JobApplication.js](file:///d:/Project/ChatGPT-Clone/backend/models/JobApplication.js). |
| **Resume Parsing** | Gemini Multi-Model Failover (via `@google/generative-ai`) | Parses PDF/Text/Docx files directly via multimodal AI prompts. Word docs extracted via `mammoth`. |
| **ATS Scoring** | Gemini (Structured JSON prompting) | Audits resumes against industry standards, returning scores (0-100), skills, and layout suggestions. |
| **Job Search** | Live APIs (JSearch/RapidAPI + Adzuna) + Gemini Fallback | Queries real-world listings with automatic fallback to AI simulation if API keys are missing. |
| **Auto Apply** | Gemini Cover Letter Agent | Auto-generates tailored cover letters for matching jobs and saves application logs to MongoDB. |
| **Email Parser** | Gemini NLP Agent | Parses company response emails, extracts company name and outcome, auto-updates application statuses. |
| **Email Confirmation** | [Nodemailer](file:///d:/Project/ChatGPT-Clone/backend/server.js) + Gmail SMTP | Dispatches real branded HTML application confirmations to the candidate's actual email address. |
| **Rate Limiting** | `express-rate-limit` | Protects all endpoints from abuse (30 auth / 200 general requests per 15-minute window). |

---

## 📂 Codebase Architecture & Files

The project is structured with a clear separation of concerns:

```
ChatGPT-Clone/
├── backend/                          # Express API server
│   ├── server.js                     # Main entrypoint: Express config, all API routes, Gemini AI integration
│   ├── db.js                         # MongoDB connection setup
│   ├── .env                          # Environment variables (secrets, API keys)
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   └── models/
│       ├── User.js                   # User schema (email, password, googleId, reset tokens)
│       ├── Conversation.js           # Chat message thread schema
│       ├── Resume.js                 # ATS evaluation results schema
│       └── JobApplication.js         # Job application tracking schema
│
├── frontend/                         # React + Vite client
│   ├── src/
│   │   ├── App.jsx                   # Main React app (2,600+ lines): all views, state, API calls
│   │   ├── App.css                   # Full CSS design system (84 KB+): themes, animations, layouts
│   │   ├── index.css                 # Global base styles
│   │   ├── main.jsx                  # React DOM entry point with Google OAuth provider
│   │   └── assets/                   # Static assets
│   ├── public/                       # Public static files
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite configuration
│   ├── vercel.json                   # Vercel deployment config
│   └── eslint.config.js              # ESLint configuration
│
├── README.md                         # Project overview and setup guide
├── INSTALLATION.md                   # Detailed installation instructions
├── API.md                            # Full API endpoint documentation
├── CONTRIBUTING.md                   # Contribution guidelines
├── report.md                         # This project report
└── test.md                           # Testing documentation
```

### Key Source Files

- [server.js](file:///d:/Project/ChatGPT-Clone/backend/server.js) (990 lines): The main backend entrypoint containing Express configurations, CORS setup, rate limiting, authorization middleware, all API routes (auth, chat, resume, auto-apply, email parsing, password reset), Gemini AI multi-model failover logic, and Nodemailer SMTP integration.
- [db.js](file:///d:/Project/ChatGPT-Clone/backend/db.js): Database connection setup for MongoDB Atlas.
- **Models**:
  - [User.js](file:///d:/Project/ChatGPT-Clone/backend/models/User.js): Database schema for storing users (email, hashed password, Google ID, reset password tokens).
  - [Conversation.js](file:///d:/Project/ChatGPT-Clone/backend/models/Conversation.js): Schema for saving user-bot message threads with timestamps.
  - [Resume.js](file:///d:/Project/ChatGPT-Clone/backend/models/Resume.js): Schema for storing ATS audit outcomes (score, skills, missing keywords, suggestions).
  - [JobApplication.js](file:///d:/Project/ChatGPT-Clone/backend/models/JobApplication.js): Schema logging applications (job title, company, location, salary, URL, cover letter, status).
- [App.jsx](file:///d:/Project/ChatGPT-Clone/frontend/src/App.jsx) (2,672 lines): The main React front-end application orchestrating all application state, views (chat + dashboard), modal displays, voice inputs, guided onboarding tour, inbox simulation, analytics, and API integrations.
- [App.css](file:///d:/Project/ChatGPT-Clone/frontend/src/App.css) (84 KB+): Comprehensive CSS design system with dark/light theme variables, CSS keyframe animations, responsive breakpoints, custom scrollbars, terminal shell styles, split-pane inbox layouts, ATS gauge visuals, and glassmorphism effects.

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Register new user (email + password) |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/google-login` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/chat` | Send message/file to AI (multipart) |
| GET | `/api/conversations` | List user conversations |
| GET | `/api/conversations/:id` | Get specific conversation |
| DELETE | `/api/conversations/:id` | Delete conversation |
| POST | `/api/resume/evaluate` | Upload & evaluate resume (ATS score) |
| POST | `/api/resume/auto-apply` | Trigger autonomous job search & apply |
| GET | `/api/resume/history` | Get resume & application history |
| POST | `/api/applications` | Manually add a job application |
| PATCH | `/api/applications/:id/status` | Update application status |
| POST | `/api/applications/parse-email` | AI-parse company email & update status |

---

*For detailed setup instructions, refer to the [INSTALLATION.md](file:///d:/Project/ChatGPT-Clone/INSTALLATION.md) and [API.md](file:///d:/Project/ChatGPT-Clone/API.md).*
