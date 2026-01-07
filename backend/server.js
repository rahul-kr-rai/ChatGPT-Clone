const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer'); 
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// --- IMPORTS ---
const connectDB = require('./db');
const User = require('./models/User');
const Conversation = require('./models/Conversation');

const app = express();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET;

// Check for critical env vars
if (!JWT_SECRET) {
  console.error("❌ FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

app.use(express.json({ limit: '50mb' }));

// CORS: Allow your Vercel frontend and Localhost
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  "https://chat-gpt-clone-six-alpha.vercel.app", // Your Vercel App
  process.env.CLIENT_URL // Optional: Add via env var
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // Optional: Relax this for development if needed, but strict is safer
      // return callback(null, true); 
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- DATABASE CONNECTION ---
connectDB();

// --- AUTH MIDDLEWARE ---
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token === "null" || token === "undefined") {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) { res.status(400).json({ error: "Email exists" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email: user.email });
  } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

// --- CHAT ROUTES ---
// Initialize Gemini only if key exists
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.error("❌ GEMINI_API_KEY is missing!");
}

function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

app.post('/api/chat', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const file = req.file;

    if (!genAI) {
        return res.status(500).json({ error: "Server Error: AI Service Unavailable" });
    }

    // UPDATED: Advanced System Instruction with Persona
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: {
        parts: [{ 
          text: `You are 'AI ChatBot', a sophisticated and helpful virtual assistant designed and developed by Rahul Kumar Rai.

          YOUR IDENTITY:
          - Creator: Rahul Kumar Rai (a Full Stack Developer).
          - Purpose: To assist users with coding, creativity, and general knowledge.
          - Personality: Professional, enthusiastic, and clear.

          YOUR GUIDELINES:
          1. OWNERSHIP: If asked "Who created you?", "Who owns you?", or "Who made you?", always answer: "I was created by Rahul Kumar Rai."
          2. FORMATTING: Always use clear Markdown formatting. Use bolding for key terms and code blocks for any programming examples.
          3. TONE: Be helpful and encouraging. If a user is stuck on code, explain the logic step-by-step.
          4. SAFETY: Do not share personal private data about your creator other than his name.
          `
        }]
      }
    });

    let promptParts = [];
    if (message) promptParts.push(message);
    if (file) {
        promptParts.push(fileToGenerativePart(file.buffer, file.mimetype));
    }

    if (promptParts.length === 0) {
      return res.status(400).json({ error: "Message or file is required" });
    }

    const result = await model.generateContent(promptParts);
    const botResponse = result.response.text();

    if (req.user) {
      let conv = null;
      
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        conv = await Conversation.findOne({ _id: conversationId, userId: req.user.id });
      }

      if (!conv) {
        const titleText = message ? message.substring(0, 30) : (file ? "Image Upload" : "New Chat");
        conv = new Conversation({ 
            userId: req.user.id, 
            title: titleText + "...", 
            messages: [] 
        });
      }

      const userMsgText = file ? `[File: ${file.originalname}] ${message || ''}` : message;

      conv.messages.push({ role: 'user', text: userMsgText }, { role: 'bot', text: botResponse });
      conv.updatedAt = Date.now();
      await conv.save();
      return res.json({ text: botResponse, conversationId: conv._id });
    }

    res.json({ text: botResponse });
  } catch (error) {
    console.error("🔴 Server Error:", error);
    res.status(500).json({ error: error.message || "AI Generation Failed" }); 
  }
});

app.get('/api/conversations', optionalAuth, async (req, res) => {
  if (!req.user) return res.json([]);
  const convs = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 }).select('title _id');
  res.json(convs);
});

app.get('/api/conversations/:id', optionalAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
  
  const conv = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
  res.json(conv);
});

app.delete('/api/conversations/:id', optionalAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Deleted" });
});

// --- GOOGLE AUTH & PASSWORD RESET ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

// GOOGLE LOGIN SETUP

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload['email'];
    const googleId = payload['sub'];

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, googleId });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, email: user.email });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(400).json({ error: "Google verification failed" });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  // Change localhost to your deployed frontend URL for production emails
  const resetLink = `https://chat-gpt-clone-six-alpha.vercel.app/reset-password/${token}`;

  await transporter.sendMail({
    to: user.email,
    subject: 'Reset Password',
    text: `Click the link to reset your password: ${resetLink}`
  });
  res.json({ message: "Reset link sent!" });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  // Verify token first to get user ID
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const user = await User.findOne({
    _id: decoded.id,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ error: "Invalid Token details" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password updated" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
