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
const Resume = require('./models/Resume');
const JobApplication = require('./models/JobApplication');

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

// --- RESUME & AUTO-APPLY ENDPOINTS ---

app.post('/api/resume/evaluate', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!genAI) {
      return res.status(500).json({ error: "AI service unavailable" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const filePart = fileToGenerativePart(file.buffer, file.mimetype);

    const prompt = `
      You are an expert ATS (Applicant Tracking System) auditor. Analyze the uploaded resume and return a structured JSON response.
      Your output must be a valid JSON object ONLY, with no extra formatting, markdown wraps (like \`\`\`json), or explanations outside of the JSON structure.

      The JSON structure MUST follow this exact schema:
      {
        "atsScore": number (0 to 100),
        "jobSearchQuery": string (a short optimized 3-5 word job search query matching the candidate's core profile, e.g. "Full Stack Developer React Node"),
        "skills": [string] (list of key skills found in the resume),
        "missingKeywords": [string] (list of relevant industry keywords/skills that are missing or underrepresented),
        "contentSuggestions": [string] (list of suggestions to improve the resume's content, bullet points, experience description),
        "formattingSuggestions": [string] (list of suggestions to improve the layout, readability, and structural elements of the resume)
      }
    `;

    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text().trim();

    let evaluation;
    try {
      const cleanedJSON = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
      evaluation = JSON.parse(cleanedJSON);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", responseText);
      return res.status(500).json({ error: "AI returned invalid response format. Please try again." });
    }

    const resumeData = new Resume({
      userId: req.user ? req.user.id : undefined,
      fileName: file.originalname,
      atsScore: evaluation.atsScore || 70,
      jobSearchQuery: evaluation.jobSearchQuery || "Software Engineer",
      skills: evaluation.skills || [],
      missingKeywords: evaluation.missingKeywords || [],
      contentSuggestions: evaluation.contentSuggestions || [],
      formattingSuggestions: evaluation.formattingSuggestions || []
    });

    await resumeData.save();

    res.json({
      success: true,
      resume: resumeData
    });
  } catch (error) {
    console.error("🔴 Resume Evaluation Error:", error);
    res.status(500).json({ error: error.message || "Resume evaluation failed" });
  }
});

app.post('/api/resume/auto-apply', optionalAuth, async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume record not found" });
    }

    if (!genAI) {
      return res.status(500).json({ error: "AI service unavailable" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const searchPrompt = `
      You are a job search matching agent. Based on the candidate's core profile and target search query: "${resume.jobSearchQuery}", generate exactly 3 relevant open job listings.
      Your response must be a valid JSON array of objects ONLY, with no extra formatting, markdown wraps (like \`\`\`json), or explanations outside of the JSON.

      The JSON structure MUST follow this exact schema:
      [
        {
          "jobTitle": string,
          "company": string,
          "location": string,
          "salary": string (e.g. "$90,000 - $110,000"),
          "description": string (brief 2-3 sentence description of the role requirements)
        }
      ]
    `;

    const searchResult = await model.generateContent(searchPrompt);
    const searchResponseText = searchResult.response.text().trim();

    let jobListings = [];
    try {
      const cleanedSearchJSON = searchResponseText.replace(/```json/i, '').replace(/```/g, '').trim();
      jobListings = JSON.parse(cleanedSearchJSON);
    } catch (e) {
      console.error("Failed to parse JSON job listings from Gemini:", searchResponseText);
      jobListings = [
        {
          jobTitle: `${resume.jobSearchQuery || 'Software Engineer'}`,
          company: "Tech Innovators Inc.",
          location: "Remote (US/Canada)",
          salary: "$100,000 - $120,000",
          description: "Looking for an energetic engineer to build out core React applications and integrate robust Node.js backend services."
        },
        {
          jobTitle: `Junior ${resume.jobSearchQuery || 'Developer'}`,
          company: "Global Core Systems",
          location: "Hybrid (New York, NY)",
          salary: "$85,000 - $95,000",
          description: "Seeking a developer to assist in designing high performance web interfaces, APIs, and optimizing database schema performances."
        }
      ];
    }

    const appliedJobs = [];

    for (const job of jobListings) {
      const coverLetterPrompt = `
        You are a career assistant. Write a professional, customized, compelling cover letter (max 250 words) for a candidate applying to the position of "${job.jobTitle}" at "${job.company}".
        The candidate has the following skills: ${resume.skills.join(', ')}.
        The job description is: "${job.description}".
        Maintain a polite, confident, and professional tone. Do not include placeholders like "[Your Name]" or "[Date]" in brackets; write it as a finished cover letter.
      `;

      const coverLetterResult = await model.generateContent(coverLetterPrompt);
      const coverLetterText = coverLetterResult.response.text().trim();

      const newApplication = new JobApplication({
        userId: req.user ? req.user.id : undefined,
        resumeId: resume._id,
        jobTitle: job.jobTitle,
        company: job.company,
        location: job.location,
        salary: job.salary,
        jobUrl: `https://${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/careers/apply`,
        coverLetter: coverLetterText,
        status: 'applied'
      });

      await newApplication.save();
      appliedJobs.push(newApplication);
    }

    res.json({
      success: true,
      applications: appliedJobs
    });

  } catch (error) {
    console.error("🔴 Auto Apply Error:", error);
    res.status(500).json({ error: error.message || "Auto application process failed" });
  }
});

app.get('/api/resume/history', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ resumes: [], applications: [] });
    }

    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const applications = await JobApplication.find({ userId: req.user.id }).sort({ appliedAt: -1 });

    res.json({
      resumes,
      applications
    });
  } catch (error) {
    console.error("🔴 Fetch Resume History Error:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve history" });
  }
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
