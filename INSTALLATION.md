# Installation & Configuration Guide

Complete setup instructions for ChatBoat development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Obtaining Google API Credentials](#obtaining-google-api-credentials)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** (version 14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - Choose one:
  - Local installation: [Download](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Git** - [Download](https://git-scm.com/)

### Verification

Check if you have the required versions:

```bash
node --version      # Should be v14.0.0 or higher
npm --version       # Should be v6.0.0 or higher
git --version       # Should be v2.0.0 or higher
```

---

## Obtaining Google API Credentials

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" > "New Project"
3. Enter project name (e.g., "ChatBoat")
4. Click "Create"
5. Wait for the project to be created

### Step 2: Enable Required APIs

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for **"Generative Language API"**
3. Click on it and press **Enable**
4. Repeat for **Google+ API** if using OAuth

### Step 3: Create API Key (for Generative AI)

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key
4. (Optional) Restrict key to specific APIs:
   - Click the key
   - Under "Application restrictions", select "API restriction"
   - Select "Generative Language API"

### Step 4: Create OAuth Credentials (for Login)

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com
   ```
5. Under "Authorized redirect URIs", add:
   ```
   http://localhost:5173/auth/google/callback
   http://localhost:3000/auth/google/callback
   https://yourdomain.com/auth/google/callback
   ```
6. Click **Create**
7. Download the JSON credentials or copy the Client ID and Client Secret

---

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/chatboat.git
cd chatboat
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

Expected output: Dependencies installed successfully

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

Expected output: Dependencies installed successfully

---

## Environment Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```bash
touch .env  # On macOS/Linux
# or
type nul > .env  # On Windows Command Prompt
```

Add the following variables:

```env
# ===== DATABASE =====
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/chatboat

# OR MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatboat?retryWrites=true&w=majority

# ===== JWT CONFIGURATION =====
JWT_SECRET=your_super_secure_random_string_here_min_32_chars
JWT_EXPIRE=7d

# ===== GOOGLE APIs =====
# Get from Google Cloud Console
GOOGLE_API_KEY=AIzaSy-your-api-key-here
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-here

# ===== EMAIL CONFIGURATION (OPTIONAL) =====
# Gmail: Enable "Less secure app access" or use App Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# ===== SERVER CONFIGURATION =====
PORT=5000
NODE_ENV=development

# ===== FRONTEND URL (for CORS) =====
FRONTEND_URL=http://localhost:5173
```

**Important Security Notes:**
- Never commit `.env` files to Git
- Use strong JWT_SECRET (use a password generator)
- Keep API keys confidential
- For Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833) instead of your account password

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```bash
touch .env  # On macOS/Linux
# or
type nul > .env  # On Windows Command Prompt
```

Add the following variables:

```env
# ===== GOOGLE OAUTH =====
# Get from Google Cloud Console
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com

# ===== API CONFIGURATION =====
VITE_API_BASE_URL=http://localhost:5000

# ===== ENVIRONMENT =====
VITE_ENV=development
```

### MongoDB Setup

#### Option A: Local MongoDB

1. **Install MongoDB Community Edition:**
   - [macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   - [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
   - [Linux](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB:**

   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Windows (CMD as Admin)
   net start MongoDB
   
   # Linux (systemd)
   sudo systemctl start mongod
   ```

3. **Verify Connection:**
   ```bash
   mongosh  # MongoDB shell
   # You should see the MongoDB prompt
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Create a database user with username and password
5. Get connection string from "Connect" button
6. Update `MONGODB_URI` in `.env`:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/chatboat?retryWrites=true&w=majority
   ```

---

## Verification

### Step 1: Verify Backend Setup

```bash
cd backend
npm start
```

Expected output:
```
Server is running on port 5000
MongoDB connected successfully
```

### Step 2: Verify Frontend Setup

In a new terminal:

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v7.2.4  ready in 345 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 3: Test in Browser

1. Open [http://localhost:5173](http://localhost:5173)
2. Try creating an account
3. Try logging in with Google OAuth
4. Test sending a message to the AI

---

## Troubleshooting

### MongoDB Connection Issues

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   # macOS
   brew services list | grep mongodb
   
   # Windows
   Get-Service MongoDB
   
   # Linux
   sudo systemctl status mongod
   ```

2. Start MongoDB if not running:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Windows (as Admin)
   net start MongoDB
   ```

3. Check MongoDB URI format in `.env`

### API Key Errors

**Error:**
```
Error: Invalid API Key for Generative Language API
```

**Solutions:**
1. Verify `GOOGLE_API_KEY` in `.env`
2. Ensure Generative Language API is enabled in Google Cloud Console
3. Check that the API key is not restricted to specific referrers

### CORS Errors

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Update `FRONTEND_URL` in backend `.env`
2. Verify backend CORS configuration allows your frontend URL
3. Check that requests include proper headers

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
```bash
# Find and kill process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Or use a different port
PORT=5001 npm start
```

### Dependencies Installation Issues

**Error:**
```
npm ERR! code ERESOLVE
```

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use legacy dependency resolution
npm install --legacy-peer-deps
```

### Node Version Issues

**Error:**
```
The engine "node" is incompatible with this module
```

**Solutions:**
1. Check your Node version:
   ```bash
   node --version
   ```

2. Install required version:
   - Using [nvm](https://github.com/nvm-sh/nvm):
     ```bash
     nvm install 18
     nvm use 18
     ```

### Email Configuration

If email features aren't working:

1. Verify `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` in `.env`
2. For Gmail:
   - Enable [2-Step Verification](https://support.google.com/accounts/answer/185839)
   - Generate [App Password](https://support.google.com/accounts/answer/185833)
   - Use the App Password in `EMAIL_PASSWORD`
3. Test with:
   ```javascript
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({...});
   transporter.verify((error, success) => {
     if (error) console.log(error);
     else console.log('Ready to send');
   });
   ```

---

## Production Deployment

### Backend Deployment (Heroku, Railway, Render)

1. Build for production:
   ```bash
   NODE_ENV=production npm start
   ```

2. Set environment variables in your hosting platform

3. Connect MongoDB Atlas for cloud database

### Frontend Deployment (Vercel, Netlify, GitHub Pages)

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder

3. Update `VITE_API_BASE_URL` to your production backend URL

---

## Next Steps

- Read [README.md](README.md) for project overview
- Check [API.md](API.md) for API documentation
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines

Need help? [Create an issue](https://github.com/yourusername/chatboat/issues) or contact support@chatboat.dev
