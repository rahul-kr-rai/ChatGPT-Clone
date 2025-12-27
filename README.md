# 🤖 AI ChatBot - MERN Stack
A powerful, multimodal AI chatbot application built using the MERN Stack (MongoDB, Express, React, Node.js). This project leverages Google's Gemini API to handle text and image inputs, providing a ChatGPT-like experience with persistent conversation history and secure authentication.

## Quick Links

📚 **Documentation:**
- [Installation & Setup](INSTALLATION.md) - Detailed setup instructions
- [API Documentation](API.md) - Complete API reference
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

---

## ✨ Features

- 🔐 **JWT & Google OAuth** - Secure authentication
- 💬 **AI-Powered Conversations** - Powered by Google Gemini API
- 📝 **Conversation Management** - Save and organize chats
- 🎨 **Modern UI** - Responsive React + Vite frontend
- 📧 **Email Support** - Built-in email notifications
- 🗂️ **MongoDB** - Persistent data storage
- 🔒 **Password Encryption** - bcryptjs security
- 📱 **File Uploads** - Multer file handling

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19.2.0, Vite 7.2.4, React Markdown, SweetAlert2 |
| **Backend** | Node.js, Express.js 5.2.1, MongoDB/Mongoose |
| **AI** | Google Generative AI (Gemini) |
| **Auth** | JWT, Google OAuth 2.0, bcryptjs |
| **DevOps** | ESLint, Nodemailer, CORS, Multer |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 14+ ([Download](https://nodejs.org/))
- MongoDB ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- Google API Key ([Get it here](https://console.cloud.google.com/))

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/chatboat.git
cd chatboat

# 2. Setup backend
cd backend
npm install

# 3. Setup frontend
cd ../frontend
npm install
```

### Configuration

**Create `.env` in `backend/`:**
```env
MONGODB_URI=mongodb://localhost:27017/chatboat
JWT_SECRET=your_secure_key_here
GOOGLE_API_KEY=your_api_key_here
GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
PORT=5000
```

**Create `.env` in `frontend/`:**
```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
VITE_API_BASE_URL=http://localhost:5000
```

👉 **[Full setup guide →](INSTALLATION.md)**

### Run Locally

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🚀

---

## 📋 Project Structure

```
ChatBoat/
├── backend/              # Express.js API
│   ├── server.js        # Main server
│   ├── db.js            # MongoDB connection
│   ├── middleware/      # Auth middleware
│   └── models/          # User, Conversation schemas
│
├── frontend/            # React app
│   ├── src/            # React components
│   ├── vite.config.js  # Build config
│   └── index.html      # Entry HTML
│
├── INSTALLATION.md      # Setup guide
├── API.md              # API reference
├── CONTRIBUTING.md     # Contribution guidelines
└── README.md           # This file
```

---

## 🔌 API Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/conversations` | New chat |
| GET | `/api/conversations` | List chats |
| POST | `/api/messages` | Send message |

👉 **[Full API docs →](API.md)**

---

## 🚀 Building for Production

```bash
# Frontend build
cd frontend
npm run build
# Creates optimized `dist/` folder

# Backend
NODE_ENV=production npm start
```

---

## 🤝 Contributing

We love contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m "feat: add feature"`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

📖 **[Full contributing guide →](CONTRIBUTING.md)**

### Quick Standards
- Follow [Airbnb JS Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable names
- Keep commits atomic and descriptive
- No hardcoded secrets or API keys

---

## 📝 License

ISC License - see [LICENSE](LICENSE) for details

**You can:**
- ✅ Use commercially
- ✅ Modify code
- ✅ Distribute freely
- ✅ Use privately

---

## 🆘 Support & Troubleshooting

**Issues?** Check [INSTALLATION.md](INSTALLATION.md#troubleshooting) for common solutions

**Common Issues:**
- MongoDB not connecting? → [See guide](INSTALLATION.md#mongodb-connection-issues)
- API key errors? → [See guide](INSTALLATION.md#api-key-errors)
- CORS problems? → [See guide](INSTALLATION.md#cors-errors)

**Get Help:**
- 📖 Read the [docs](INSTALLATION.md)
- 🐛 [Open an issue](https://github.com/yourusername/chatboat/issues)
- 💬 [Start a discussion](https://github.com/yourusername/chatboat/discussions)

---

## 🙏 Acknowledgments

- [Google Generative AI](https://ai.google.dev/) - Gemini API
- [Express.js](https://expressjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Vite](https://vitejs.dev/) - Build tool

---

## Connect

- 📩 [Email](mailto:support@chatboat.dev)
- 💼 [LinkedIn](https://linkedin.com/in/yourusername)
- 🌐 [Website](https://chatboat.dev)

---

**Happy coding!** 🚀 We're excited to see what you build with ChatBoat.
