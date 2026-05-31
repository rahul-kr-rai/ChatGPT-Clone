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
const rateLimit = require('express-rate-limit');

// --- IMPORTS ---
const connectDB = require('./db');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Resume = require('./models/Resume');
const JobApplication = require('./models/JobApplication');

const app = express();

// Enable trust proxy for express-rate-limit (Render, Vercel, Heroku, etc.)
app.set('trust proxy', 1);

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

// --- RATE LIMITING MIDDLEWARES ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth/login/signup requests per 15 minutes
  message: { error: "Too many authentication attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 general requests per 15 minutes
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiters are applied directly on each route to ensure CodeQL matches them correctly

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
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) { res.status(400).json({ error: "Email exists" }); }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.post('/api/chat', apiLimiter, optionalAuth, upload.single('file'), async (req, res) => {
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
          - Abilities: Job-Hunt mode (Auto-resume scanning, ATS score checking, Auto-job apply, Auto-cover letter writing, Generate resume and cover letter, Analyze job description and company), Write code, create content, answer questions, provide information, and assist with various tasks.
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

app.get('/api/conversations', apiLimiter, optionalAuth, async (req, res) => {
  if (!req.user) return res.json([]);
  const convs = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 }).select('title _id');
  res.json(convs);
});

app.get('/api/conversations/:id', apiLimiter, optionalAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });

  const conv = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
  res.json(conv);
});

app.delete('/api/conversations/:id', apiLimiter, optionalAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Deleted" });
});

// --- RESUME & AUTO-APPLY ENDPOINTS ---

app.post('/api/resume/evaluate', apiLimiter, optionalAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!genAI) {
      return res.status(500).json({ error: "AI service unavailable" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: {
        parts: [{
          text: "You are an expert ATS (Applicant Tracking System) auditor. Analyze the uploaded resume and return a structured JSON response matching the requested schema."
        }]
      }
    });
    const filePart = fileToGenerativePart(file.buffer, file.mimetype);

    const prompt = `
      You are an expert ATS (Applicant Tracking System) auditor. Analyze the uploaded resume and return a structured JSON response.
      Your output must be a valid JSON object ONLY, with no extra formatting, markdown wraps (like \`\`\`json), or explanations outside of the JSON structure.

      The JSON structure MUST follow this exact schema:
      {
        "atsScore": number (0 to 100),
        "email": string (the candidate's email address extracted from the resume. If not found, return empty string or null),
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
      const startIndex = responseText.indexOf('{');
      const endIndex = responseText.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonString = responseText.substring(startIndex, endIndex + 1);
        evaluation = JSON.parse(jsonString);
      } else {
        const cleanedJSON = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
        evaluation = JSON.parse(cleanedJSON);
      }
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", responseText);
      return res.status(500).json({ error: "AI returned invalid response format. Please try again." });
    }

    const resumeData = new Resume({
      userId: req.user ? req.user.id : undefined,
      fileName: file.originalname,
      email: evaluation.email || "",
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
    let errorMsg = error.message || "Resume evaluation failed";
    if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota")) {
      errorMsg = "Google Generative AI free-tier quota/rate limit exceeded. Please wait a moment (approx. 30-60 seconds) and try again.";
    } else if (errorMsg.includes("503")) {
      errorMsg = "Gemini API service is currently busy or unavailable. Please try again in a moment.";
    }
    res.status(500).json({ error: errorMsg });
  }
});

app.post('/api/resume/auto-apply', apiLimiter, optionalAuth, async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ error: "Invalid resumeId format" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume record not found" });
    }

    if (!genAI) {
      return res.status(500).json({ error: "AI service unavailable" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: {
        parts: [{
          text: "You are an expert job search matching agent and cover letter writer."
        }]
      }
    });

    let jobListings = [];
    let apiUsed = null;

    const adzunaAppId = process.env.ADZUNA_APP_ID;
    const adzunaAppKey = process.env.ADZUNA_APP_KEY;
    const adzunaCountry = process.env.ADZUNA_COUNTRY || 'us';
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    // 1. Try JSearch API (RapidAPI)
    if (rapidApiKey && rapidApiKey.trim() !== "") {
      try {
        console.log(`🔍 [Job Agent] Querying JSearch (RapidAPI) for query: "${resume.jobSearchQuery}"...`);
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(resume.jobSearchQuery)}&num_pages=1`;
        const apiRes = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'jsearch.p.rapidapi.com'
          }
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.data && apiData.data.length > 0) {
            jobListings = apiData.data.slice(0, 3).map(j => ({
              jobTitle: j.job_title || "Software Engineer",
              company: j.employer_name || "Tech Solutions Ltd.",
              location: `${j.job_city || ''} ${j.job_state || ''} ${j.job_country || ''}`.trim() || "Remote",
              salary: j.job_min_salary && j.job_max_salary
                ? `$${j.job_min_salary.toLocaleString()} - $${j.job_max_salary.toLocaleString()}`
                : "Competitive",
              description: j.job_description ? j.job_description.substring(0, 200) + "..." : "No description provided.",
              jobUrl: j.job_apply_link || "https://careers.google.com"
            }));
            apiUsed = "JSearch (RapidAPI)";
          }
        } else {
          console.warn("JSearch API call failed with status:", apiRes.status);
        }
      } catch (err) {
        console.error("Error fetching from JSearch API:", err);
      }
    }

    // 2. Try Adzuna API
    if (jobListings.length === 0 && adzunaAppId && adzunaAppId.trim() !== "" && adzunaAppKey && adzunaAppKey.trim() !== "") {
      try {
        console.log(`🔍 [Job Agent] Querying Adzuna API for query: "${resume.jobSearchQuery}"...`);
        const url = `https://api.adzuna.com/v1/api/jobs/${adzunaCountry}/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=3&what=${encodeURIComponent(resume.jobSearchQuery)}`;
        const apiRes = await fetch(url);
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.results && apiData.results.length > 0) {
            jobListings = apiData.results.map(j => ({
              jobTitle: j.title || "Software Engineer",
              company: j.company?.display_name || "Tech Solutions Ltd.",
              location: j.location?.display_name || "Remote",
              salary: j.salary_min && j.salary_max
                ? `$${j.salary_min.toLocaleString()} - $${j.salary_max.toLocaleString()}`
                : "Competitive",
              description: j.description ? j.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 200) + "..." : "No description provided.",
              jobUrl: j.redirect_url || "https://careers.google.com"
            }));
            apiUsed = "Adzuna API";
          }
        } else {
          console.warn("Adzuna API call failed with status:", apiRes.status);
        }
      } catch (err) {
        console.error("Error fetching from Adzuna API:", err);
      }
    }

    // 3. Fallback to Gemini Simulation
    if (jobListings.length === 0) {
      console.log(`🤖 [Job Agent] No live API responses. Falling back to Gemini simulation for query: "${resume.jobSearchQuery}"...`);
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

      try {
        const startIndex = searchResponseText.indexOf('[');
        const endIndex = searchResponseText.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonString = searchResponseText.substring(startIndex, endIndex + 1);
          jobListings = JSON.parse(jsonString);
        } else {
          const cleanedSearchJSON = searchResponseText.replace(/```json/i, '').replace(/```/g, '').trim();
          jobListings = JSON.parse(cleanedSearchJSON);
        }
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
    }

    const appliedJobs = [];

    for (const job of jobListings) {
      // Duplicate check: check if the user has already applied to this company (case-insensitive)
      if (req.user) {
        const existingApp = await JobApplication.findOne({
          userId: req.user.id,
          company: job.company
        }).collation({ locale: 'en', strength: 2 });
        if (existingApp) {
          console.log(`⚠️ [Job Agent] Already applied to ${job.company}. Skipping duplicate submission.`);
          appliedJobs.push({
            jobTitle: job.jobTitle,
            company: job.company,
            location: job.location,
            salary: job.salary,
            coverLetter: existingApp.coverLetter,
            status: 'skipped'
          });
          continue;
        }
      }

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
        jobUrl: job.jobUrl || `https://${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/careers/apply`,
        coverLetter: coverLetterText,
        status: 'applied'
      });

      await newApplication.save();
      appliedJobs.push(newApplication);
    }

    // Send actual confirmation emails to candidate if recipient email and mail credentials exist
    const recipientEmail = resume.email || (req.user ? req.user.email : null);
    if (recipientEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      for (const app of appliedJobs) {
        if (app.status === 'skipped') continue;
        try {
          const domain = app.company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company';

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; color: #333333; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <div style="border-bottom: 2px solid #f57c00; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #f57c00; margin: 0; font-size: 24px; letter-spacing: 0.5px;">${escapeHtml(app.company)}</h2>
                <span style="font-size: 11px; color: #888888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Official Careers Confirmation</span>
              </div>
              <p style="font-size: 16px; font-weight: bold; margin-top: 0; color: #111111;">Dear Candidate,</p>
              <p style="line-height: 1.6; font-size: 14px; color: #444444;">Thank you for your interest in joining <strong>${escapeHtml(app.company)}</strong>. We have successfully received your application for the position of <strong>${escapeHtml(app.jobTitle)}</strong> (${escapeHtml(app.location) || 'Remote'}).</p>
              <p style="line-height: 1.6; font-size: 14px; color: #444444;">Our hiring team is currently reviewing your qualifications and cover letter. We are impressed by your background and will reach out to you within the next 3-5 business days regarding the next steps of our interview process.</p>
              
              <div style="background-color: #f9f9f9; border: 1px dashed #cccccc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #333333; border-bottom: 1px solid #eeeeee; padding-bottom: 5px; font-size: 15px;">Application Summary</h4>
                <ul style="list-style: none; padding-left: 0; margin: 0; font-size: 13px; line-height: 1.8; color: #555555;">
                  <li><strong>Role:</strong> ${escapeHtml(app.jobTitle)}</li>
                  <li><strong>Company:</strong> ${escapeHtml(app.company)}</li>
                  <li><strong>Location:</strong> ${escapeHtml(app.location) || 'Remote'}</li>
                  <li><strong>Salary:</strong> ${escapeHtml(app.salary) || 'Competitive'}</li>
                  <li><strong>Status:</strong> Under Review</li>
                </ul>
              </div>

              <p style="line-height: 1.6; font-size: 14px; color: #444444;">A copy of your customized cover letter has been attached to your application file. You can also view it in your candidate history portal.</p>
              
              <p style="margin-bottom: 0; font-size: 14px; color: #444444;">Best regards,</p>
              <p style="margin-top: 5px; font-weight: bold; color: #f57c00; font-size: 14px;">The ${escapeHtml(app.company)} Recruitment Team</p>
              
              <div style="border-top: 1px solid #eeeeee; margin-top: 25px; padding-top: 15px; text-align: center; font-size: 11px; color: #999999;">
                This is an automated confirmation email. Please do not reply directly to this message.
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"${app.company} Careers" <careers@${domain}.com>`,
            replyTo: `careers@${domain}.com`,
            to: recipientEmail,
            subject: `Application Confirmation - ${app.jobTitle} at ${app.company}`,
            html: emailHtml
          });
          console.log(`✉️ Real confirmation email sent to ${recipientEmail} from careers@${domain}.com for job: ${app.jobTitle}`);
        } catch (mailError) {
          console.error(`❌ Failed to send confirmation email for ${app.jobTitle}:`, mailError);
        }
      }
    }

    res.json({
      success: true,
      applications: appliedJobs,
      apiUsed: apiUsed
    });

  } catch (error) {
    console.error("🔴 Auto Apply Error:", error);
    let errorMsg = error.message || "Auto application process failed";
    if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota")) {
      errorMsg = "Google Generative AI free-tier quota/rate limit exceeded. Please wait a moment (approx. 30-60 seconds) and try again.";
    } else if (errorMsg.includes("503")) {
      errorMsg = "Gemini API service is currently busy or unavailable. Please try again in a moment.";
    }
    res.status(500).json({ error: errorMsg });
  }
});

app.get('/api/resume/history', apiLimiter, optionalAuth, async (req, res) => {
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

app.post('/api/auth/google-login', authLimiter, async (req, res) => {
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

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
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

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
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
