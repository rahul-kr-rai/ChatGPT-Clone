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
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const JWT_SECRET = process.env.JWT_SECRET || 'rahul_kumar_rai_secret_key';

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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
    }

    // Using gemini-2.5-flash as per your request, ensure you have access or fallback to 1.5
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let promptParts = [];
    if (message) promptParts.push(message);
    if (file) {
        promptParts.push(fileToGenerativePart(file.buffer, file.mimetype));
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
    res.status(500).json({ error: error.message }); 
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

const client = new OAuth2Client("302999478006-b74kqht2au61f4u9kqnakeadn31fil9u.apps.googleusercontent.com");

app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "302999478006-b74kqht2au61f4u9kqnakeadn31fil9u.apps.googleusercontent.com",
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

  await transporter.sendMail({
    to: user.email,
    subject: 'Reset Password',
    text: `Reset link: http://localhost:5173/reset-password/${token}`
  });
  res.json({ message: "Reset link sent!" });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ error: "Invalid Token" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password updated" });
});

app.listen(5000, () => console.log("🚀 Server: http://localhost:5000"));