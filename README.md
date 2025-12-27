# ChatBoat 🤖

A full-stack AI-powered chatbot application that leverages Google's Generative AI (Gemini) to provide intelligent conversational experiences. ChatBoat offers seamless authentication, conversation management, and a beautiful user interface for interactive AI conversations.

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

---

## Features

✨ **Core Features**
- 🔐 **JWT & Google OAuth** - Secure authentication
- 💬 **AI-Powered Conversations** - Powered by Google Gemini API
- 📝 **Conversation Management** - Save and organize chats
- 🎨 **Modern UI** - Responsive React + Vite frontend
- 📧 **Email Support** - Built-in email notifications
- 🗂️ **MongoDB** - Persistent data storage
- 🔒 **Password Encryption** - bcryptjs security
- 📱 **File Uploads** - Multer file handling

---

## Project Structure

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

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19.2.0, Vite 7.2.4, React Markdown, SweetAlert2 |
| **Backend** | Node.js, Express.js 5.2.1, MongoDB/Mongoose |
| **AI** | Google Generative AI (Gemini) |
| **Auth** | JWT, Google OAuth 2.0, bcryptjs |
| **DevOps** | ESLint, Nodemailer, CORS, Multer |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 14.0.0 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local or MongoDB Atlas cloud account)
- **Google API Credentials** (for Generative AI and OAuth)
- **Git** (for cloning the repository)

### Obtaining Google API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **Generative Language API**
4. Create an **API Key** for the backend
5. For OAuth, create **OAuth 2.0 credentials** (Client ID for web application)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/rahul-kr-rai/chatboat.git
cd chatboat
```

### Step 2: Setup Backend

```bash
cd backend
npm install
```

### Step 3: Setup Frontend

```bash
cd ../frontend
npm install
```

### Step 4: Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatboat
# or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatboat?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Google API
GOOGLE_API_KEY=your_google_generative_ai_api_key_here
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret_here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Server
PORT=5000
NODE_ENV=development
```

Create a `.env` file in the `frontend` directory:

```env
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here
VITE_API_BASE_URL=http://localhost:5000
```

---

## Configuration

### Backend Configuration

**Server Port**: Edit `server.js` to modify the default port (default: 5000)

**CORS Settings**: Configure allowed origins in `server.js` if deploying to production

**Database**: Update `MONGODB_URI` in `.env` to connect to your MongoDB instance

### Frontend Configuration

**API Base URL**: Update `VITE_API_BASE_URL` in `.env` to match your backend URL

**Vite Config**: Modify `vite.config.js` for custom build settings

---

## Usage

### Running the Application Locally

**Terminal 1 - Start the Backend Server**

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Start the Frontend Development Server**

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Visit `http://localhost:5173` in your browser to access the application.

### Building for Production

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/google-auth` | Google OAuth authentication |
| POST | `/api/auth/logout` | Logout user |

### Conversation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations` | Get all user conversations |
| GET | `/api/conversations/:id` | Get specific conversation |
| PUT | `/api/conversations/:id` | Update conversation |
| DELETE | `/api/conversations/:id` | Delete conversation |

### Message Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send message to AI |
| GET | `/api/messages/:conversationId` | Get conversation messages |

*Note: All endpoints (except auth) require JWT authentication*

---

## Contributing

We welcome contributions from the community! Please follow these guidelines to ensure a smooth contribution process.

### Getting Started with Contributing

1. **Fork the Repository**
   - Click the "Fork" button on the GitHub repository page
   - This creates a copy under your GitHub account

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/chatboat.git
   cd chatboat
   ```

3. **Add Upstream Remote** (to stay synced with the original repo)
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/chatboat.git
   git fetch upstream
   ```

### Making Changes

**Step 1: Create a Feature Branch**

Use a clear, descriptive branch name following the pattern: `feature/feature-name` or `fix/bug-name`

```bash
# Sync with upstream first
git fetch upstream
git checkout upstream/main

# Create and switch to your feature branch
git checkout -b feature/amazing-feature
```

**Step 2: Make Your Changes**

- Edit files as needed for your feature or bug fix
- Keep commits atomic (one logical change per commit)
- Write meaningful commit messages

```bash
git add .
git commit -m "feat: Add amazing feature that improves user experience"
```

**Step 3: Keep Your Branch Updated**

```bash
git fetch upstream
git rebase upstream/main
```

### Submitting Pull Requests

**Step 1: Push to Your Fork**

```bash
git push origin feature/amazing-feature
```

**Step 2: Create a Pull Request**

1. Go to the original repository
2. Click "New Pull Request"
3. Select your branch as the source
4. Fill out the PR template with:
   - **Title**: Clear, descriptive title (e.g., "Add user profile update feature")
   - **Description**: 
     - What problem does this solve?
     - What changes were made?
     - How to test the changes?
   - **Screenshots**: If UI changes, include before/after screenshots
   - **Related Issues**: Reference any related issues (e.g., "Fixes #123")

**Step 3: Respond to Feedback**

- Maintainers may request changes
- Update your branch with requested changes
- Re-push the branch; the PR updates automatically

### Coding Standards

**JavaScript/Node.js**
- Use ES6+ syntax (arrow functions, const/let, template literals)
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable names
- Add comments for complex logic
- Maintain consistent indentation (2 spaces)

```javascript
// ✅ Good
const getUserData = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

// ❌ Avoid
function get_user_data(uid){
  var u=User.findById(uid);
  return u;
}
```

**React/JSX**
- Use functional components with hooks
- Keep components small and focused
- Use destructuring for props
- Follow PascalCase for component names
- Use camelCase for functions and variables

```jsx
// ✅ Good
const UserProfile = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId);
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// ❌ Avoid
const userProfile = (props) => {
  const user = props.userData;
  return <div>{user}</div>;
};
```

**Git Commit Messages**
Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(auth): Add Google OAuth login functionality
fix(chat): Resolve message display issue on mobile
docs: Update API documentation
```

**Code Review Checklist**
- [ ] Code follows the style guide
- [ ] No console.log or debugging code left
- [ ] Comments explain "why", not "what"
- [ ] No hardcoded sensitive data
- [ ] Tests are included (if applicable)
- [ ] Changes don't break existing functionality

### Reporting Issues

Found a bug? Have a feature request? Please report it!

**Before Reporting**
1. Check [existing issues](https://github.com/rahul-kr-rai/chatboat/issues) to avoid duplicates
2. Try to reproduce the issue with the latest code

**Creating an Issue**

Click "New Issue" and provide:

1. **Title**: Clear, concise description
   - ✅ "Login fails with Google OAuth on Safari"
   - ❌ "Bug in authentication"

2. **Description**:
   ```markdown
   **Describe the bug**
   A clear description of what the bug is.
   
   **To Reproduce**
   Steps to reproduce the behavior:
   1. Go to '...'
   2. Click on '...'
   3. See error
   
   **Expected behavior**
   What you expected to happen.
   
   **Screenshots**
   If applicable, add screenshots.
   
   **Environment**
   - OS: [e.g., Windows 10, macOS]
   - Browser: [e.g., Chrome 120]
   - Node version: [e.g., 18.0.0]
   ```

3. **Labels**: Add relevant labels (bug, feature, documentation)

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: Add my feature"

# 3. Push to fork
git push origin feature/my-feature

# 4. Create PR on GitHub

# 5. After approval, maintainers will merge
```

---

## License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

The ISC License is a permissive open-source license that allows:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

With the condition that:
- 📋 License and copyright notice must be included

---

## Support

### Getting Help

- **Documentation**: Check the [project wiki](https://github.com/rahul-kr-rai/chatboat/wiki)
- **Issues**: Search [existing issues](https://github.com/rahul-kr-rai/chatboat/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/rahul-kr-rai/chatboat/discussions)
- **Email**: Contact us at support@chatboat.dev

### Troubleshooting

**MongoDB Connection Issues**
```
Error: connect ECONNREFUSED
Solution: Ensure MongoDB is running or check MONGODB_URI in .env
```

**API Key Errors**
```
Error: Invalid API Key
Solution: Verify GOOGLE_API_KEY in .env matches your Google Cloud credentials
```

**CORS Errors**
```
Error: CORS policy blocked request
Solution: Update CORS settings in backend/server.js for your frontend URL
```

---

## Acknowledgments

- [Google Generative AI](https://ai.google.dev/) for the Gemini API
- [Express.js](https://expressjs.com/) community
- [React](https://react.dev/) ecosystem
- All contributors who have helped with code, bug reports, and feedback

---

## Connect With Us

- 📩 [Email](rahulkumarrai2711@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/rahulkumarraivgu/)
- 🌐 [Website](https://github.com/rahul-kr-rai)

---

**Happy coding! We're excited to see what you build with ChatBoat.** 🚀
