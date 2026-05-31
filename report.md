# 📊 Project Report: AI ChatBot (MERN Stack & Agentic AI)

This report outlines the capabilities, architecture, features, and technology stack of the **AI ChatBot** project (also referred to as **ChatBoat**). 

---

## 🚀 Project Overview

The project is a full-featured, responsive, and secure MERN stack web application that replicates and extends the ChatGPT experience. By integrating Google's Gemini generative AI model, it provides conversational text, multimodal image/file interactions, hands-free voice inputs, persistent user histories, and a specialized **Agentic Job-Hunt Mode** (Version 2.0).

---

## 🛠️ Technology Stack & Tools

The application leverages a modern, production-ready developer stack:

### Frontend
- **Framework & Tooling**: [React (v19)](file:///d:/Project/ChatGPT-Clone/frontend/package.json) & [Vite (v7)](file:///d:/Project/ChatGPT-Clone/frontend/package.json) for lightning-fast HMR and building an optimized client bundle.
- **State Management & UI**: Vanilla CSS ([App.css](file:///d:/Project/ChatGPT-Clone/frontend/src/App.css)) with clean responsive layouts, modern dark/light themes, custom CSS keyframes, SweetAlert2 for rich dialogs, and Lucide React icons.
- **Integrations**: 
  - `@google/genai` & `googleapis` for AI API interactions.
  - `@react-oauth/google` for seamless Google login integrations.
  - `react-markdown` and `remark-gfm` to format AI answers nicely (supporting tables, code blocks, lists, and links).
  - `react-syntax-highlighter` to highlight code snippets with full copy-to-clipboard functionality.

### Backend
- **Runtime & Server**: Node.js & Express (v5.x) backend ([server.js](file:///d:/Project/ChatGPT-Clone/backend/server.js)) handling security, routing, static uploads, and AI integration.
- **Database**: MongoDB with Mongoose ODM ([db.js](file:///d:/Project/ChatGPT-Clone/backend/db.js)) storing users, conversation history, and job application tracking logs.
- **Generative AI client**: `@google/generative-ai` to query the Gemini-2.5-Flash model.
- **Authentication**: JWT (`jsonwebtoken`) for secure session tokens, `google-auth-library` to verify Google OAuth credentials, and `bcryptjs` for encryption.
- **Utilities**: `multer` to handle in-memory file upload buffers, `nodemailer` for SMTP emails, and `dotenv` to manage environment variables.

---

## ✨ Key Capabilities & Abilities

### 1. Conversational AI Engine
- **Multimodal Prompting**: Users can input text questions or upload files (images, PDFs, or TXTs) directly. Gemini processes file buffers to answer queries dynamically.
- **Developer Persona**: Enforces a custom AI personality system instruction naming the assistant "AI ChatBot" created by Rahul Kumar Rai.
- **Real-time Streaming Simulation**: Features thinking loaders and the ability to abort responses instantly via `AbortController`.
- **Hands-Free Voice Input**: Uses the Web Speech API inside [App.jsx](file:///d:/Project/ChatGPT-Clone/frontend/src/App.jsx) to translate voice commands into text input.

### 2. Multi-tenant Authentication & Security
- **Email Sign-up & Login**: User registration is secured by hashing passwords with `bcryptjs`.
- **Google OAuth 2.0**: Single click log-in using Google accounts.
- **Secure Sessions**: Authentication state is maintained using JWT tokens sent in the `Authorization: Bearer <token>` request header.
- **Password Reset**: If forgotten, users can request a reset link which generates a short-lived token and dispatches a recovery email via Nodemailer.

### 3. Persistent Conversation Logs
- User histories are persisted inside the [Conversation.js](file:///d:/Project/ChatGPT-Clone/backend/models/Conversation.js) schema.
- Users can view a sidebar history, select past chats to resume them, or delete conversations securely.

### 4. Agentic AI Job Application System (Version 2.0)
The application includes a powerful, autonomous **Job-Hunt Mode** that enables a complete simulated and real-world recruitment workflow:
- **ATS Evaluator**: Parses resume documents (PDF, text, docx) and computes an ATS score.
- **Database Tracking**: Logs execution parameters, resume suggestions, and applications in MongoDB.
- **Intelligent Branching Flow**:
  - **ATS Score < 80**: Returns layout formatting, missing keywords, and profile improvement lists.
  - **ATS Score >= 80**: Searches/simulates matching positions, drafts bespoke cover letters, logs applications, and triggers emails.
- **Activity Terminal**: Displays live operation console logs on the frontend dashboard.
- **Candidate Inbox Simulation**: Renders an interactive split-pane mail client layout where users read confirmation emails.
- **Nodemailer SMTP Integration**: Sends actual confirmation HTML emails to the candidate's personal mailbox.

#### 🛠️ Tech Stack & Components Used for Version 2.0

| Component | Technology Implemented | Why / How It Works |
| --- | --- | --- |
| **Frontend** | [React.js](file:///d:/Project/ChatGPT-Clone/frontend/src/App.jsx) + Vanilla CSS ([App.css](file:///d:/Project/ChatGPT-Clone/frontend/src/App.css)) | Lightweight UI with circular CSS gauges, interactive log terminals, and a split-pane inbox. |
| **Backend** | [Node.js](file:///d:/Project/ChatGPT-Clone/backend/server.js) + [Express](file:///d:/Project/ChatGPT-Clone/backend/server.js) | Scalable backend hosting API routes, auth middleware, and processing resume upload buffers. |
| **Database** | [MongoDB](file:///d:/Project/ChatGPT-Clone/backend/db.js) + [Mongoose ODM](file:///d:/Project/ChatGPT-Clone/backend/models/Resume.js) | Structured schemas for [Resume.js](file:///d:/Project/ChatGPT-Clone/backend/models/Resume.js) and [JobApplication.js](file:///d:/Project/ChatGPT-Clone/backend/models/JobApplication.js). |
| **Resume Parsing** | [Gemini 2.5 Flash](file:///d:/Project/ChatGPT-Clone/backend/server.js#L233) (via `@google/generative-ai`) | Parses PDF/Text/Docx files directly via multimodal AI prompts instead of bulky Python parser libs. |
| **ATS Scoring** | [Gemini 2.5 Flash](file:///d:/Project/ChatGPT-Clone/backend/server.js#L233) (Structured JSON prompting) | Audits resumes against industry standards, returning scores (0-100), skills, and layout suggestions. |
| **Job Search Integration** | Live APIs (JSearch / Adzuna) + Gemini Fallback | Queries real-world listings via JSearch (RapidAPI) or Adzuna API, with automatic fallback to Gemini AI simulation if API keys are missing. |
| **Auto Apply** | [Gemini 2.5 Flash Cover Letter Agent](file:///d:/Project/ChatGPT-Clone/backend/server.js#L372) | Auto-generates tailored cover letters for matching jobs and saves application logs to the database. |
| **Email Confirmation** | [Nodemailer](file:///d:/Project/ChatGPT-Clone/backend/server.js#L487) + SMTP (Gmail) | Dispatches real HTML application confirmations to the candidate's actual email address. |

---

## 📂 Codebase Architecture & Files

The project is structured with a clear separation of concerns:

- [server.js](file:///d:/Project/ChatGPT-Clone/backend/server.js): The main backend entrypoint containing Express configurations, authorization middleware, API routes, and Gemini prompts.
- [db.js](file:///d:/Project/ChatGPT-Clone/backend/db.js): Database connection setup for MongoDB.
- **Models**:
  - [User.js](file:///d:/Project/ChatGPT-Clone/backend/models/User.js): Database schema for storing users.
  - [Conversation.js](file:///d:/Project/ChatGPT-Clone/backend/models/Conversation.js): Schema for saving user-bot message threads.
  - [Resume.js](file:///d:/Project/ChatGPT-Clone/backend/models/Resume.js): Schema for storing ATS audit outcomes and suggested enhancements.
  - [JobApplication.js](file:///d:/Project/ChatGPT-Clone/backend/models/JobApplication.js): Schema logging applications, matching companies, and customized cover letters.
- [App.jsx](file:///d:/Project/ChatGPT-Clone/frontend/src/App.jsx): The main React front-end application orchestrating application state, views, modal displays, voice inputs, and API integrations.
- [App.css](file:///d:/Project/ChatGPT-Clone/frontend/src/App.css): Styled using raw CSS tokens with animations, dark mode overrides, custom scrollbars, terminal shells, and split-pane configurations.

---

*For detailed setup instruction, refer to the [INSTALLATION.md](file:///d:/Project/ChatGPT-Clone/INSTALLATION.md) and [API.md](file:///d:/Project/ChatGPT-Clone/API.md).*
