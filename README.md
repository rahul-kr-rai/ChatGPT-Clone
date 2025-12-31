# 🤖 AI ChatBot - MERN Stack

A powerful, multimodal AI chatbot application built using the MERN Stack (MongoDB, Express, React, Node.js). This project leverages Google's Gemini API to handle text and image inputs, providing a ChatGPT-like experience with persistent conversation history and secure authentication.

---

## ✨ Features

- Secure authentication: email/password with bcrypt and JWT, plus Google OAuth login
- AI-powered responses using Google Generative AI (Gemini) for text and file inputs
- Persistent conversations stored in MongoDB with per-user history
- File uploads (images/files) supported via `multer` for multimodal prompts
- Email-based password reset and notifications via `nodemailer`
- Responsive React + Vite frontend with conversation management UI
- CORS-configurable backend and environment-driven configuration via `dotenv`

## 🛠 Tech Stack

- Frontend: React (v19.x), Vite (v7.x), React Markdown, SweetAlert2
- Backend: Node.js, Express (v5.x), `@google/generative-ai` (Gemini client)
- Database: MongoDB with Mongoose ODM
- Authentication: JWT (`jsonwebtoken`), Google OAuth (`google-auth-library`)
- Utilities: `bcryptjs`, `multer`, `cors`, `nodemailer`, `dotenv`

---

## Repository structure

```
ChatBoat/
├── backend/                # Express API
│   ├── server.js           # Main server & routes
│   ├── db.js               # DB connection (reads process.env.MONGO_URI)
│   ├── .env
│   ├── middleware/         # Auth and other middleware
│   │   └── auth.js
│   └── models/             # Mongoose models (User, Conversation)
│
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── assets
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── Index.css
│   │   ├── Main.jsx
│   │   └── .env
│   ├── public/
│   └── vite.config.js
```
├── API.md
├── CONTRIBUTING.md
├── INSTALLATION.md
└── README.md               # (this file)
```

---

## Prerequisites

- Node.js 14+ (Node 18+ recommended)
- npm (bundled with Node.js)
- MongoDB (local or Atlas)
- Google Cloud credentials for Generative AI / OAuth (if you use those features)

---



## Installation

1) Clone the repo:

```bash
git clone https://github.com/yourusername/chatboat.git
cd chatboat
```

2) Install backend dependencies:

```bash
cd backend
npm install
```

3) Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

## Environment variables (important)

Note: the code expects specific environment variable names. Keep these exact keys in your `.env` files.

Backend (`backend/.env`):

- `MONGO_URI` — MongoDB connection string (e.g. mongodb://localhost:27017/chatboat)
- `JWT_SECRET` — secret string used to sign JWT tokens (required)
- `GEMINI_API_KEY` — Google Generative AI key (optional; if missing AI features are disabled)
- `GOOGLE_CLIENT_ID` — OAuth client id for Google sign-in (optional)
- `EMAIL_USER` — account used to send emails (optional)
- `EMAIL_PASS` — password or app password for the email account (optional)
- `CLIENT_URL` — frontend URL allowed by CORS (optional)
- `PORT` — server port (default in code: 10000 if not set)

Example `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/chatboat
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
EMAIL_USER=youremail@example.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
PORT=5000
```

Frontend (`frontend/.env`):

- `VITE_GOOGLE_OAUTH_CLIENT_ID` — Google OAuth client id used in the frontend (optional)
- `VITE_API_BASE_URL` — backend base URL (e.g. http://localhost:5000)

Example `frontend/.env`:

```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
VITE_API_BASE_URL=http://localhost:5000
```

Important: previously the README referenced `MONGODB_URI` — the code uses `MONGO_URI`. Use `MONGO_URI` in your backend `.env`.

---

## Running (development)

1) Start the backend (from `/backend`):

```bash
npm start
# runs: node server.js (per backend/package.json)
```

2) Start the frontend (from `/frontend`):

```bash
npm run dev
# runs Vite dev server (default: http://localhost:5173)
```

Open the frontend in your browser (typically `http://localhost:5173`).

---

## Build & Production

Frontend build:

```bash
cd frontend
npm run build
# deploy contents of dist/ to your static host
```

Backend production:

Set `NODE_ENV=production` and run your preferred process manager (PM2, systemd, Docker, etc.). Basic example:

```bash
NODE_ENV=production npm start
# or: node server.js
```

---

## API (quick reference)

Common endpoints (see `API.md` for full docs):

- POST `/api/auth/signup` — create account (email + password)
- POST `/api/auth/login` — login (returns JWT)
- POST `/api/auth/google-login` — Google OAuth login
- POST `/api/chat` — send message or file to the AI (multipart/form-data if uploading files)
- GET `/api/conversations` — list user conversations
- GET `/api/conversations/:id` — get conversation
- DELETE `/api/conversations/:id` — delete conversation

Authentication: send `Authorization: Bearer <token>` header where required.

---

## Notes & troubleshooting

- If the server exits immediately with an error about `JWT_SECRET` missing, add `JWT_SECRET` to `backend/.env`.
- If Mongo fails to connect, confirm `MONGO_URI` and network/Atlas whitelist settings.
- If AI features are disabled, set `GEMINI_API_KEY`.
- For CORS issues, set `CLIENT_URL` in `backend/.env` or modify `allowedOrigins` in `server.js`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

If you want, I can also:

- update `INSTALLATION.md` to match these corrected env names and commands
- run the backend locally (if you allow) to verify startup errors

File updated: [README.md](README.md)


**Build Backend**
```bash
cd backend
# Backend is production-ready as Node.js/Express runs directly
```

**Build Frontend**
```bash
cd frontend
npm run build
# Creates optimized build in dist/ directory
```

### Linting

```bash
cd frontend
npm run lint
# Check code quality with ESLint
```

---

## API Endpoints

### Authentication Endpoints
-----------------------------------------------------------------
| Method |         Endpoint       |         Description         |
|--------|------------------------|-----------------------------|
| POST   | `/api/auth/register`   | Register a new user         |
| POST   | `/api/auth/login`      | Login user                  |
| POST   | `/api/auth/google-auth`| Google OAuth authentication |
| POST   | `/api/auth/logout`     | Logout user                 |
-----------------------------------------------------------------

### Conversation Endpoints

------------------------------------------------------------------
| Method |         Endpoint         |        Description         |
|--------|--------------------------|----------------------------|
| POST   | `/api/conversations`     | Create new conversation    |
| GET    | `/api/conversations`     | Get all user conversations |
| GET    | `/api/conversations/:id` | Get specific conversation  |
| PUT    | `/api/conversations/:id` | Update conversation        |
| DELETE | `/api/conversations/:id` | Delete conversation        |
------------------------------------------------------------------

### Message Endpoints

------------------------------------------------------------------------
| Method |            Endpoint             |       Description         |
|--------|---------------------------------|---------------------------|
| POST   | `/api/messages`                 | Send message to AI        |
| GET    | `/api/messages/:conversationId` | Get conversation messages |
------------------------------------------------------------------------

*Note: All endpoints (except auth) require JWT authentication*

## Connect With Us

- 📩 [Email](rahulkumarrai2711@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/rahulkumarraivgu/)
- 🌐 [Website](https://github.com/rahul-kr-rai)

---

**Happy coding!❤️ We're excited to see what you build with ChatBoat.** 🚀
