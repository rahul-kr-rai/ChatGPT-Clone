const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'rahul_kumar_rai_secret_key';

// 1. Connection to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/geminiChat')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [{
    role: { type: String, enum: ['user', 'bot'] },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});
const Conversation = mongoose.model('Conversation', conversationSchema);

// --- OPTIONAL AUTH MIDDLEWARE ---
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) req.user = null;
    else req.user = user;
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
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, email: user.email });
});

// --- CHAT ROUTES ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', optionalAuth, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    // Safety check for API Key
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in server .env");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);
    const botResponse = result.response.text();

    if (req.user) {
      let conv = null;
      
      // Validate conversationId format before querying MongoDB
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        conv = await Conversation.findOne({ _id: conversationId, userId: req.user.id });
      }

      if (!conv) {
        conv = new Conversation({ 
            userId: req.user.id, 
            title: message.substring(0, 30) + "...", 
            messages: [] 
        });
      }

      conv.messages.push({ role: 'user', text: message }, { role: 'bot', text: botResponse });
      conv.updatedAt = Date.now();
      await conv.save();
      return res.json({ text: botResponse, conversationId: conv._id });
    }

    res.json({ text: botResponse });
  } catch (error) {
    console.error("🔴 Server Error:", error); // This helps you debug in terminal
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/conversations', optionalAuth, async (req, res) => {
  if (!req.user) return res.json([]);
  const convs = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 }).select('title _id');
  res.json(convs);
});

// New Route: Fetch single conversation messages
app.get('/api/conversations/:id', optionalAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
  
  const conv = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
  res.json(conv);
});

app.listen(5000, () => console.log("🚀 Server: http://localhost:5000"));