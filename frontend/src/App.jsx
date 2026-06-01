import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoSend } from "react-icons/io5";
import {
  Paperclip, Search, GraduationCap, Image as ImageIcon, Mic,
  Plus, Trash2, X, Sun, Moon, Square, Menu, AlertTriangle, Briefcase,
  MessageSquare, Mail, FileText, RefreshCw, Star, Archive, MoreVertical,
  CornerUpLeft, CornerUpRight, ExternalLink, BarChart2, TrendingUp,
  Award, Target
} from 'lucide-react';
import Swal from 'sweetalert2';
import { GoogleLogin } from '@react-oauth/google';
import './App.css';

const generateEmailBody = (app) => {
  return `
    <div class="gmail-email-card" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid var(--border-email-card); border-radius: 8px; background-color: var(--bg-email-card); color: var(--text-email-card-main);">
      <div style="border-bottom: 2px solid #f57c00; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
        <h2 style="color: #f57c00; margin: 0;">${app.company}</h2>
        <span style="font-size: 12px; color: var(--text-email-card-secondary);">Official Careers Confirmation</span>
      </div>
      <p style="font-size: 16px; font-weight: bold; margin-top: 0; color: inherit;">Dear Candidate,</p>
      <p style="color: inherit;">Thank you for your interest in joining <strong>${app.company}</strong>. We have successfully received your application for the position of <strong>${app.jobTitle}</strong> (${app.location || 'Remote'}).</p>
      <p style="color: inherit;">Our hiring team is currently reviewing your qualifications and cover letter. We are impressed by your background and will reach out to you within the next 3-5 business days regarding the next steps of our interview process.</p>
      
      <div style="background-color: var(--bg-email-card-summary); border: 1px dashed var(--border-email-card-summary); padding: 15px; border-radius: 6px; margin: 20px 0; color: inherit;">
        <h4 style="margin-top: 0; color: inherit; border-bottom: 1px solid var(--border-email-card); padding-bottom: 5px;">Application Summary</h4>
        <ul style="list-style: none; padding-left: 0; margin: 0; font-size: 14px; line-height: 1.6; color: inherit;">
          <li style="color: inherit;"><strong style="color: inherit;">Role:</strong> ${app.jobTitle}</li>
          <li style="color: inherit;"><strong style="color: inherit;">Company:</strong> ${app.company}</li>
          <li style="color: inherit;"><strong style="color: inherit;">Location:</strong> ${app.location || 'Remote'}</li>
          <li style="color: inherit;"><strong style="color: inherit;">Salary:</strong> ${app.salary || 'Competitive'}</li>
          <li style="color: inherit;"><strong style="color: inherit;">Status:</strong> Under Review</li>
        </ul>
      </div>

      <p style="color: inherit;">A copy of your customized cover letter has been attached to your application file. You can also view it in your candidate history portal.</p>
      
      <p style="margin-bottom: 0; color: inherit;">Best regards,</p>
      <p style="margin-top: 5px; font-weight: bold; color: #f57c00;">The ${app.company} Recruitment Team</p>
      
      <div style="border-top: 1px solid var(--border-email-card); margin-top: 25px; padding-top: 15px; text-align: center; font-size: 11px; color: var(--text-email-card-secondary);">
        This is an automated confirmation email. Please do not reply directly to this message.
      </div>
    </div>
  `;
};

function App() {
  // --- CONFIGURATION ---
  // PROD: Uses Vercel Env Var. DEV: Uses localhost.
  const API_BASE = import.meta.env.DEV 
    ? "http://localhost:10000" 
    : (import.meta.env.VITE_API_BASE_URL || "http://localhost:10000");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // New State for the "+" Menu
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // --- Voice Input State ---
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // --- Mobile Sidebar State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme State (Default to Dark)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // File Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Warning Card State
  const [showWarningCard, setShowWarningCard] = useState(false);
  const [isWarningCardClosing, setIsWarningCardClosing] = useState(false);

  // Job-Hunt Mode State
  const [jobHuntMode, setJobHuntMode] = useState(
    localStorage.getItem('jobHuntMode') === 'true' && !!localStorage.getItem('user')
  );

  // Job-Hunt Dashboard States
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'dashboard'
  const [dashboardSidebarTab, setDashboardSidebarTab] = useState('resume'); // 'resume', 'inbox', 'applied', 'analytics'
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30'); // '7', '14', '30', 'all'
  const [analyticsCompanyFilter, setAnalyticsCompanyFilter] = useState('');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [atsSuggestions, setAtsSuggestions] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('All');

  // Goal 7: Candidate Inbox states
  const [inboxEmails, setInboxEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Cover Letter Modal
  const toggleStarEmail = (id) => {
    setInboxEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
    if (selectedEmail?.id === id) {
      setSelectedEmail(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  const toggleReadEmail = (id) => {
    setInboxEmails(prev => prev.map(e => e.id === id ? { ...e, read: !e.read } : e));
    if (selectedEmail?.id === id) {
      setSelectedEmail(prev => prev ? { ...prev, read: !prev.read } : null);
    }
  };

  const handleDeleteEmail = (id) => {
    setInboxEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
  };
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');

  // Refs
  const chatEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const terminalEndRef = useRef(null);

  // Removed generateEmailBody from inner scope and moved it above the App component

  const fetchJobHuntHistory = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/resume/history`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.applications) {
          setAppliedJobs(data.applications);
          
          const emails = data.applications.map(app => {
            const domain = app.company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company';
            return {
              id: app._id,
              fromName: `${app.company} Careers`,
              fromEmail: `careers@${domain}.com`,
              subject: `Application Confirmation - ${app.jobTitle}`,
              date: new Date(app.appliedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              body: generateEmailBody(app),
              coverLetter: app.coverLetter,
              read: true
            };
          });
          setInboxEmails(emails);
        }
        if (data.resumes && data.resumes.length > 0) {
          setAtsScore(data.resumes[0].atsScore);
          setAtsSuggestions({
            skills: data.resumes[0].skills,
            missingKeywords: data.resumes[0].missingKeywords,
            contentSuggestions: data.resumes[0].contentSuggestions,
            formattingSuggestions: data.resumes[0].formattingSuggestions
          });
        }
      }
    } catch (err) {
      console.error("Error fetching job hunt history:", err);
    }
  }, [user, API_BASE]);

  useEffect(() => {
    if (currentView === 'dashboard' && user) {
      fetchJobHuntHistory();
    }
  }, [currentView, user, fetchJobHuntHistory]);

  useEffect(() => {
    if (currentView === 'dashboard') {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [agentLogs, currentView]);

  // --- Theme Effect ---
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // --- Job-Hunt Mode Effect ---
  useEffect(() => {
    localStorage.setItem('jobHuntMode', jobHuntMode);
    document.body.setAttribute('data-job-hunt', jobHuntMode);
    if (jobHuntMode) {
      setCurrentView('dashboard');
      fetchJobHuntHistory();
    } else {
      setCurrentView('chat');
    }
  }, [jobHuntMode, fetchJobHuntHistory]);

  // --- Warning Card Effects & Trigger ---
  useEffect(() => {
    if (user) {
      setShowWarningCard(false);
      return;
    }
    const timer = setTimeout(() => setShowWarningCard(true), 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const triggerCloseWarningCard = () => {
    setIsWarningCardClosing(true);
    setTimeout(() => {
      setShowWarningCard(false);
      setIsWarningCardClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (showWarningCard && !isWarningCardClosing) {
      const hideTimer = setTimeout(() => {
        triggerCloseWarningCard();
      }, 10000); // 10 seconds
      return () => clearTimeout(hideTimer);
    }
  }, [showWarningCard, isWarningCardClosing]);

  // --- Click Outside to Close Attach Menu ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAttachMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        btnRef.current &&
        !btnRef.current.contains(event.target)
      ) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachMenu]);

  // Load Conversation List
  useEffect(() => {
    if (user) {
      fetch(`${API_BASE}/api/conversations`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setConversations(data); })
        .catch(err => console.error(err));
    }
  }, [user, API_BASE]);

  // Load Specific Chat History
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user && activeConvId) {
        try {
          const res = await fetch(`${API_BASE}/api/conversations/${activeConvId}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          const data = await res.json();
          if (data && data.messages) {
            setMessages(data.messages);
          }
          // On mobile, close sidebar when a chat is selected
          setIsSidebarOpen(false);
        } catch (err) {
          console.error("Failed to load chat history:", err);
        }
      }
    };
    loadChatHistory();
  }, [activeConvId, user, API_BASE]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleToggleJobHuntMode = () => {
    if (!user) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to activate Job-Hunt Mode.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#10a37f',
        cancelButtonColor: '#444',
        confirmButtonText: 'Log In Now',
        background: theme === 'dark' ? '#232323ff' : '#edededff',
        color: theme === 'dark' ? '#fff' : '#000'
      }).then((result) => {
        if (result.isConfirmed) {
          setAuthMode('login');
          setShowAuth(true);
        }
      });
      return;
    }
    setJobHuntMode(prev => !prev);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to log out?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10a37f',
      cancelButtonColor: '#444',
      confirmButtonText: 'Yes, Logout',
      background: theme === 'dark' ? '#232323ff' : '#edededff',
      color: theme === 'dark' ? '#fff' : '#000'
    });

    if (result.isConfirmed) {
      localStorage.removeItem('user');
      localStorage.removeItem('jobHuntMode');
      setJobHuntMode(false);
      setUser(null);
      setMessages([]);
      setConversations([]);
      setActiveConvId(null);
      setIsSidebarOpen(false); // Close sidebar on logout
    }
  };

  // --- Voice Input Handler ---
  const handleMicClick = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Swal.fire({
        icon: 'error',
        title: 'Not Supported',
        text: 'Your browser does not support Voice Input. Try Chrome or Edge.',
        background: theme === 'dark' ? '#232323ff' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000'
      });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => { console.error(e); setIsListening(false); };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => {
        const newData = prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + transcript;
        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
          }
        }, 0);
        return newData;
      });
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // --- File Handling Functions ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowAttachMenu(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setDashboardSidebarTab('resume');
    setIsAnalyzingResume(true);
    setAtsScore(null);
    setAtsSuggestions(null);
    setAppliedJobs([]);
    setAgentLogs([
      "🤖 [System] Initializing Agentic AI Resume Evaluator...",
      "📄 [Document] Uploading: " + file.name,
    ]);

    const formData = new FormData();
    formData.append("file", file);

    const headers = {};
    if (user) headers["Authorization"] = `Bearer ${user.token}`;

    try {
      setAgentLogs(prev => [...prev, "🧠 [AI Agent] Parsing resume text and computing ATS score..."]);
      const res = await fetch(`${API_BASE}/api/resume/evaluate`, {
        method: "POST",
        headers: headers,
        body: formData
      });
      
      if (!res.ok) {
        let errMsg = "Evaluation server error: status " + res.status;
        try {
          const errData = await res.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch {
          // Ignore JSON parsing errors for error status
        }
        throw new Error(errMsg);
      }
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      const score = data.resume.atsScore;
      setAtsScore(score);
      setAtsSuggestions({
        skills: data.resume.skills,
        missingKeywords: data.resume.missingKeywords,
        contentSuggestions: data.resume.contentSuggestions,
        formattingSuggestions: data.resume.formattingSuggestions
      });

      setAgentLogs(prev => [
        ...prev,
        `📈 [AI Agent] ATS score audit completed. Score: ${score}%`,
        score >= 80 
          ? "✅ [AI Agent] ATS Score meets threshold (80%). Initiating autonomous job hunt..."
          : "⚠️ [AI Agent] ATS Score is below threshold (80%). Providing targeted recommendations to optimize your resume."
      ]);

      if (score >= 80) {
        setAgentLogs(prev => [
          ...prev,
          `🔍 [Job Agent] Searching matching positions for query: "${data.resume.jobSearchQuery}"...`
        ]);

        const applyRes = await fetch(`${API_BASE}/api/resume/auto-apply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers
          },
          body: JSON.stringify({ resumeId: data.resume._id })
        });
        
        if (!applyRes.ok) {
          let errMsg = "Application server error: status " + applyRes.status;
          try {
            const errData = await applyRes.json();
            if (errData && errData.error) errMsg = errData.error;
          } catch {
            // Ignore JSON parsing errors for error status
          }
          throw new Error(errMsg);
        }
        
        const applyData = await applyRes.json();
        if (!applyData.success) {
          throw new Error(applyData.error || "Job application flow failed");
        }

        const sourceLabel = applyData.apiUsed ? `via ${applyData.apiUsed}` : "via AI Simulation";
        const freshApps = applyData.applications.filter(app => app.status !== 'skipped');
        const skippedApps = applyData.applications.filter(app => app.status === 'skipped');

        setAgentLogs(prev => [
          ...prev,
          `🎯 [Job Agent] Found ${applyData.applications.length} matching job openings ${sourceLabel}.`,
          ...applyData.applications.flatMap(app => 
            app.status === 'skipped'
              ? [`⚠️ [Job Agent] Already applied to "${app.company}". Skipping duplicate submission.`]
              : [
                  `📝 [Apply Agent] Custom cover letter generated for "${app.jobTitle}" at "${app.company}".`,
                  `🚀 [Apply Agent] Application submitted successfully to ${app.company}. (Status: APPLIED)`
                ]
          ),
          freshApps.length > 0 
            ? `🏆 [System] Autonomous job hunt completed. Submitted ${freshApps.length} fresh application(s).`
            : `🏆 [System] Autonomous job hunt completed. No fresh applications submitted (skipped ${skippedApps.length} duplicates).`
        ]);

        setAppliedJobs(prev => [...freshApps, ...prev]);

        const newEmails = freshApps.map(app => {
          const domain = app.company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company';
          return {
            id: app._id || Math.random().toString(36).substr(2, 9),
            fromName: `${app.company} Careers`,
            fromEmail: `careers@${domain}.com`,
            subject: `Application Confirmation - ${app.jobTitle}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            body: generateEmailBody(app),
            coverLetter: app.coverLetter,
            read: false
          };
        });
        setInboxEmails(prev => [...newEmails, ...prev]);
      }

    } catch (err) {
      console.error(err);
      setAgentLogs(prev => [...prev, `❌ [Error] Process failed: ${err.message}`]);
      Swal.fire({
        title: 'Resume Evaluation Failed',
        text: err.message || 'Something went wrong during resume evaluation. Please try again.',
        icon: 'error',
        confirmButtonColor: '#10a37f',
        background: theme === 'dark' ? '#232323ff' : '#edededff',
        color: theme === 'dark' ? '#fff' : '#000'
      });
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleStopGeneration = (e) => {
    e.preventDefault();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    setShowAttachMenu(false);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentMessage = input;
    const displayMsg = selectedFile ? `📄 [Uploaded: ${selectedFile.name}]\n\n${currentMessage}` : currentMessage;

    setMessages(prev => [...prev, { role: 'user', text: displayMsg }]);
    setInput('');
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', currentMessage);
      if (activeConvId) formData.append('conversationId', activeConvId);
      if (selectedFile) formData.append('file', selectedFile);

      const headers = {};
      if (user) headers['Authorization'] = `Bearer ${user.token}`;

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: headers,
        body: formData,
        signal: controller.signal
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
      clearFile();

      if (user && !activeConvId && data.conversationId) {
        setActiveConvId(data.conversationId);
        const newChat = { _id: data.conversationId, title: currentMessage.substring(0, 30) || "File Upload" };
        setConversations(prev => [newChat, ...prev]);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => [...prev, { role: 'bot', text: "*Generation stopped by user.*" }]);
      } else {
        console.error(err);
        setMessages(prev => [...prev, { role: 'bot', text: "Error sending message." }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete Chat?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff3a3a',
      cancelButtonColor: '#444',
      confirmButtonText: 'Yes, delete it',
      background: theme === 'dark' ? '#232323ff' : '#edededff',
      color: theme === 'dark' ? '#fff' : '#000'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_BASE}/api/conversations/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        setConversations(prev => prev.filter(c => c._id !== id));
        if (activeConvId === id) { setActiveConvId(null); setMessages([]); }
        Swal.fire({
          title: 'Deleted!',
          text: 'Conversation has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: theme === 'dark' ? '#232323ff' : '#edededff',
          color: theme === 'dark' ? '#fff' : '#000'
        });
      } catch (err) { console.error(err); }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConvId(null);
    setInput('');
    clearFile();
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const url = authMode === 'login' ? 'login' : 'signup';
    try {
      const res = await fetch(`${API_BASE}/api/auth/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setShowAuth(false);
        setMessages([]);
        setActiveConvId(null);
      } else if (authMode === 'signup' && res.ok) {
        alert("Registration successful! Now Login.");
        setAuthMode('login');
      } else { alert(data.error); }
    } catch (err) { console.error(err); }
  };

  const handleForgotPassword = async () => {
    setShowAuth(false);
    const bgColor = theme === 'dark' ? '#232323ff' : '#ffffff';
    const txtColor = theme === 'dark' ? '#f9f9f9' : '#333333';

    const { value: email, isDismissed } = await Swal.fire({
      title: 'Reset Password',
      text: 'Enter your email address to receive a recovery link.',
      input: 'email',
      inputPlaceholder: 'name@example.com',
      background: bgColor,
      color: txtColor,
      confirmButtonColor: '#10a37f',
      cancelButtonColor: '#444',
      showCancelButton: true,
      confirmButtonText: 'Send Link',
      customClass: { popup: 'high-index-swal' },
      inputValidator: (value) => { if (!value) return 'Please enter your email address'; }
    });

    if (isDismissed) { setShowAuth(true); return; }

    if (email) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (res.ok) {
          await Swal.fire({ title: 'Email Sent!', text: `Recovery link sent to ${email}`, icon: 'success', background: bgColor, color: txtColor, confirmButtonColor: '#10a37f' });
        } else {
          await Swal.fire({ title: 'Error', text: 'Could not send email. Try again.', icon: 'error', background: bgColor, color: txtColor });
          setShowAuth(true);
        }
      } catch (error) { console.error(error); setShowAuth(true); }
    }
  };

  const getDisplayStatus = (job, index) => {
    if (job.status && job.status !== 'applied') {
      return job.status;
    }
    const statuses = ['applied', 'under review', 'interviewing', 'rejected'];
    return statuses[index % statuses.length];
  };

  const renderStatusBadge = (status) => {
    const s = (status || 'Applied').toLowerCase();
    let badgeClass = 'badge-applied';
    let label = 'Applied';

    if (s === 'under review' || s === 'under_review') {
      badgeClass = 'badge-under-review';
      label = 'Under Review';
    } else if (s === 'interviewing' || s === 'interview') {
      badgeClass = 'badge-interviewing';
      label = 'Interviewing';
    } else if (s === 'rejected' || s === 'failed') {
      badgeClass = 'badge-rejected';
      label = 'Rejected';
    }

    return <span className={`status-badge ${badgeClass}`}>{label}</span>;
  };

  const filteredJobs = appliedJobs.filter((job, index) => {
    const status = getDisplayStatus(job, index);

    const matchesSearch =
      job.jobTitle.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(appliedSearchQuery.toLowerCase());

    const matchesStatus =
      appliedStatusFilter === 'All' ||
      status.toLowerCase() === appliedStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="chatgpt-main" data-theme={theme}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,application/pdf,text/plain"
      />

      <nav className="top-navbar">
        {/* --- MOBILE TOGGLE BUTTON --- */}
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu size={24} />
        </button>

        <div className="nav-brand">AI ChatBot-2.1<span className="arrow">▾</span></div>
        <div className="nav-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div 
            className={`job-hunt-toggle ${jobHuntMode ? 'active' : ''}`} 
            onClick={handleToggleJobHuntMode} 
            title="Toggle Job-Hunt Mode"
          >
            <Briefcase size={16} />
            <span className="toggle-label">Job-Hunt Mode</span>
            <div className="toggle-switch">
              <span className="toggle-slider"></span>
            </div>
          </div>

          {!user ? (
            <>
              <button className="login-trigger" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Log in</button>
              <button className="signup-trigger" onClick={() => { setAuthMode('signup'); setShowAuth(true); }}>Sign up</button>
            </>
          ) : (
            <div className="user-profile" onClick={handleLogout} title="Click to Logout">
              {user.email[0].toUpperCase()}
            </div>
          )}
        </div>
      </nav>

      {currentView === 'chat' ? (
        <div className="body-container">
        {/* --- MOBILE OVERLAY --- */}
        {isSidebarOpen && (
          <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* --- SIDEBAR --- */}
        <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          {/* --- MOBILE SIDEBAR HEADER WITH TITLE --- */}
          <div className="sidebar-header-mobile">
            <span className="sidebar-title">Chat History</span>
            <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <button className="new-chat-btn" onClick={handleNewChat}>
            <Plus size={16} /> New Chat
          </button>
          <div className="conv-history">
            {user ? conversations.map(c => (
              <div
                key={c._id}
                className={`history-item ${activeConvId === c._id ? 'active' : ''}`}
                onClick={() => setActiveConvId(c._id)}
              >
                <span className="conv-title">{c.title}</span>
                <button className="delete-btn" onClick={(e) => handleDeleteConversation(e, c._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )) : <div className="guest-label">Log in to save Chat history</div>}
          </div>
        </aside>

        <main className="chat-view">
          <div className="scrollable-messages">
            {messages.length === 0 ? (
              <div className="hero-landing"><h1>How can I help you?</h1></div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`msg-row ${msg.role}`}>
                    <div className="msg-wrapper">
                      <div className="text-box">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeContent = String(children).replace(/\n$/, '');

                              return !inline && match ? (
                                <CodeBlock language={match[1]} value={codeContent} />
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="msg-row bot">
                    <div className="msg-wrapper">
                      <div className="text-box thinking-text">AI ChatBot is thinking...</div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="input-fixed-bottom">
            <div className="input-pill-container">
              {selectedFile && (
                <div className="file-preview-pill">
                  <span className="file-name">{selectedFile.name}</span>
                  <button onClick={clearFile} className="remove-file-btn"><X size={14} /></button>
                </div>
              )}

              {/* --- POPOVER MENU --- */}
              {showAttachMenu && (
                <div className="attach-menu-popover" ref={menuRef}>
                  {jobHuntMode && (
                    <button className="menu-item ats-option" onClick={() => { setCurrentView('dashboard'); setDashboardSidebarTab('resume'); setShowAttachMenu(false); }}>
                      <Briefcase size={18} style={{ color: '#f57c00' }} /> <span style={{ color: '#f57c00', fontWeight: 'bold' }}>ATS Auto-Apply</span>
                    </button>
                  )}
                  <button className="menu-item" onClick={() => { fileInputRef.current.click(); setShowAttachMenu(false); }}>
                    <Paperclip size={18} /> Upload File
                  </button>
                  <button className="menu-item" onClick={() => setShowAttachMenu(false)}>
                    <Search size={18} /> Search
                  </button>
                  <button className="menu-item" onClick={() => setShowAttachMenu(false)}>
                    <GraduationCap size={18} /> Study
                  </button>
                  <button className="menu-item" onClick={() => setShowAttachMenu(false)}>
                    <ImageIcon size={18} /> Create Image
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="pill-form">
                <button
                  type="button"
                  className={`attach-toggle-btn ${showAttachMenu ? 'active' : ''}`}
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  ref={btnRef}
                >
                  <Plus
                    size={24}
                    style={{
                      transform: showAttachMenu ? 'rotate(45deg)' : 'none',
                      transition: '0.2s'
                    }}
                  />
                </button>

                <textarea
                  ref={textAreaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={selectedFile ? "Add a caption..." : (isListening ? "Listening..." : "Ask anything")}
                  rows="1"
                  onClick={() => setShowAttachMenu(false)}
                />

                <div className="input-tools">
                  <span
                    className={`mic-tool ${isListening ? 'active-mic' : ''}`}
                    onClick={handleMicClick}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    <Mic size={18} />
                  </span>

                  {isLoading ? (
                    <button type="button" className="send-tool stop-tool" onClick={handleStopGeneration} title="Stop generation">
                      <Square size={14} fill="currentColor" />
                    </button>
                  ) : (
                    <button type="submit" className="send-tool" disabled={(!input.trim() && !selectedFile)}>
                      <IoSend size={18} />
                    </button>
                  )}
                </div>
              </form>
            </div>
            <p className="privacy-disclaimer"> Made by <a href="https://github.com/rahul-kr-rai" target="_blank" rel="noopener noreferrer">Rahul Kumar Rai</a> ❤️ &copy; 2025</p>
          </div>
        </main>
      </div>
      ) : (
        <div className="job-dashboard-page">
          <aside className="job-dashboard-sidebar">
            <button 
              className={`sidebar-nav-item ${dashboardSidebarTab === 'resume' ? 'active' : ''}`}
              onClick={() => setDashboardSidebarTab('resume')}
            >
              <FileText size={16} /> Resume & ATS
            </button>
            <button 
              className={`sidebar-nav-item ${dashboardSidebarTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setDashboardSidebarTab('inbox')}
            >
              <Mail size={16} /> Inbox
              {inboxEmails.filter(e => !e.read).length > 0 && (
                <span className="inbox-badge">{inboxEmails.filter(e => !e.read).length}</span>
              )}
            </button>
            <button 
              className={`sidebar-nav-item ${dashboardSidebarTab === 'applied' ? 'active' : ''}`}
              onClick={() => setDashboardSidebarTab('applied')}
            >
              <Briefcase size={16} /> Applied Jobs
            </button>
            <button 
              className={`sidebar-nav-item ${dashboardSidebarTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setDashboardSidebarTab('analytics')}
            >
              <BarChart2 size={16} /> Analytics
            </button>
          </aside>

          <main className="job-dashboard-main-content">
            {dashboardSidebarTab === 'resume' && (
              <div className="resume-workflow-container">
                {/* Stage 1: Upload & Evaluation (atsScore === null OR atsScore < 80) */}
                {(atsScore === null || atsScore < 80) && (
                  <div className="resume-upload-evaluation-stage">
                    {/* Upload Dropzone */}
                    {atsScore === null && (
                      <>
                        <div className={`resume-dropzone ${isAnalyzingResume ? 'analyzing' : ''}`}>
                          <input 
                            type="file" 
                            id="resume-file-input"
                            accept=".pdf,.txt,.doc,.docx"
                            style={{ display: 'none' }}
                            disabled={isAnalyzingResume}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleResumeUpload(e.target.files[0]);
                              }
                            }}
                          />
                          <label htmlFor="resume-file-input" className="dropzone-label">
                            <Paperclip size={32} />
                            <span>{isAnalyzingResume ? "Analyzing Resume..." : "Drag & Drop Resume or Click to Upload"}</span>
                            <small>Supports PDF, DOCX, TXT (Max 5MB)</small>
                          </label>
                        </div>
                        
                        {!isAnalyzingResume && (
                          <div className="resume-motivational-illustration">
                            <div className="pulse-network">
                              <div className="pulse-circle c1"></div>
                              <div className="pulse-circle c2"></div>
                              <div className="pulse-circle c3"></div>
                              <div className="center-node">
                                <Briefcase size={24} style={{ color: '#f57c00' }} />
                              </div>
                            </div>
                            <h3>Autonomous Job Applying Agent</h3>
                            <p>Upload your resume to evaluate your ATS score. Our agent will automatically search matching job boards, write tailored cover letters, and submit applications on your behalf.</p>
                            <div className="feature-badges">
                              <span className="badge">✓ Real-time Live Jobs</span>
                              <span className="badge">✓ Custom Cover Letters</span>
                              <span className="badge">✓ Anti-Duplicate Check</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ATS Score & Suggestions (If score < 80) */}
                    {atsScore !== null && atsScore < 80 && (
                      <div className="ats-results-box">
                        <div className="ats-results-header">
                          <div className="gauge-container">
                            <div className={`ats-gauge ${atsScore >= 80 ? 'pass' : 'fail'}`} style={{ '--score-percentage': `${atsScore}` }}>
                              <div className="gauge-inner">
                                <span className="gauge-value">{atsScore}%</span>
                                <span className="gauge-label">ATS Score</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            className="restart-btn"
                            onClick={() => {
                              setAtsScore(null);
                              setAtsSuggestions(null);
                              setAgentLogs([]);
                              setSelectedFile(null);
                            }}
                          >
                            <RefreshCw size={14} /> Try Another Resume
                          </button>
                        </div>
                        
                        <div className="suggestions-list">
                          <h3>Optimization Suggestions</h3>
                          {atsSuggestions.missingKeywords && atsSuggestions.missingKeywords.length > 0 && (
                            <div className="suggestion-section">
                              <h4>Missing Keywords</h4>
                              <div className="keyword-tags">
                                {atsSuggestions.missingKeywords.map((kw, i) => (
                                  <span key={i} className="keyword-tag">{kw}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {atsSuggestions.contentSuggestions && atsSuggestions.contentSuggestions.length > 0 && (
                            <div className="suggestion-section">
                              <h4>Content Improvements</h4>
                              <ul>
                                {atsSuggestions.contentSuggestions.map((sug, i) => (
                                  <li key={i}>{sug}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {atsSuggestions.formattingSuggestions && atsSuggestions.formattingSuggestions.length > 0 && (
                            <div className="suggestion-section">
                              <h4>Layout & Formatting</h4>
                              <ul>
                                {atsSuggestions.formattingSuggestions.map((sug, i) => (
                                  <li key={i}>{sug}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* While ATS check is running, show a progress log or status */}
                    {isAnalyzingResume && (
                      <div className="ats-analyzing-progress">
                        <div className="progress-spinner"></div>
                        <div className="progress-text">Evaluator is scanning text, checking keywords, and calculating ATS score...</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stage 2: Agent Execution Log (atsScore >= 80) */}
                {atsScore !== null && atsScore >= 80 && (
                  <div className="agent-terminal-full">
                    <div className="terminal-header">
                      <div className="terminal-dots">
                        <span className="terminal-dot red"></span>
                        <span className="terminal-dot yellow"></span>
                        <span className="terminal-dot green"></span>
                      </div>
                      <span className="terminal-title">Agent Execution Log</span>
                      <span className="terminal-status-badge">{isAnalyzingResume ? "ACTIVE" : "COMPLETED"}</span>
                    </div>
                    <div className="terminal-content">
                      {agentLogs.length === 0 ? (
                        <div className="terminal-empty">No execution logs yet. Upload your resume to start.</div>
                      ) : (
                        agentLogs.map((log, i) => (
                          <div key={i} className="terminal-line">{log}</div>
                        ))
                      )}
                      {isAnalyzingResume && <div className="terminal-line pulse-line">█ Agent is processing...</div>}
                      <div ref={terminalEndRef} />
                    </div>

                    {/* Stage 3: Process End Stage button */}
                    {!isAnalyzingResume && (
                      <div className="terminal-action-area">
                        <button 
                          className="apply-new-resume-btn"
                          onClick={() => {
                            setAtsScore(null);
                            setAtsSuggestions(null);
                            setAgentLogs([]);
                            setSelectedFile(null);
                          }}
                        >
                          <RefreshCw size={16} /> Apply with New Resume
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {dashboardSidebarTab === 'inbox' && (
              <div className="inbox-split-pane gmail-style">
                <div className="email-list-side gmail-list-pane">
                  <div className="gmail-toolbar">
                    <input type="checkbox" className="gmail-checkbox-all" checked={inboxEmails.length > 0 && inboxEmails.every(e => e.read)} onChange={() => {
                      const allRead = inboxEmails.every(e => e.read);
                      setInboxEmails(prev => prev.map(e => ({ ...e, read: !allRead })));
                    }} title="Select all / Mark all read" />
                    <button className="gmail-toolbar-btn" onClick={() => {
                      fetchJobHuntHistory();
                    }} title="Refresh Inbox">
                      <RefreshCw size={14} />
                    </button>
                    <span className="gmail-inbox-title">Inbox ({inboxEmails.filter(e => !e.read).length})</span>
                  </div>
                  {inboxEmails.length === 0 ? (
                    <div className="inbox-empty-state">No confirmation emails yet.</div>
                  ) : (
                    <div className="gmail-email-list">
                      {inboxEmails.map((email) => {
                        const emailSnippet = "We have received your job application and are checking your profile details...";
                        return (
                          <div 
                            key={email.id} 
                            className={`gmail-email-item ${email.read ? 'read' : 'unread'} ${selectedEmail?.id === email.id ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedEmail(email);
                              setInboxEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
                            }}
                          >
                            <div className="gmail-item-left-controls">
                              <span 
                                className={`gmail-star-icon ${email.starred ? 'starred' : ''}`} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStarEmail(email.id);
                                }}
                              >
                                <Star size={16} fill={email.starred ? "#f59e0b" : "none"} stroke={email.starred ? "#f59e0b" : "currentColor"} />
                              </span>
                            </div>
                            <div className="gmail-item-main-content">
                              <div className="gmail-item-row-top">
                                <span className="gmail-sender-name">{email.fromName}</span>
                                <span className="gmail-item-time">{email.date}</span>
                              </div>
                              <div className="gmail-item-row-bottom">
                                <span className="gmail-subject-text">{email.subject}</span>
                                <span className="gmail-body-snippet"> - {emailSnippet}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="email-reader-side gmail-reader-pane">
                  {selectedEmail ? (
                    <div className="gmail-email-container">
                      <div className="gmail-reader-toolbar">
                        <button className="gmail-toolbar-btn" onClick={() => toggleReadEmail(selectedEmail.id)} title={selectedEmail.read ? "Mark as unread" : "Mark as read"}>
                          <Mail size={16} />
                        </button>
                        <button className="gmail-toolbar-btn" onClick={() => toggleStarEmail(selectedEmail.id)} title={selectedEmail.starred ? "Unstar" : "Star"}>
                          <Star size={16} fill={selectedEmail.starred ? "#f59e0b" : "none"} stroke={selectedEmail.starred ? "#f59e0b" : "currentColor"} />
                        </button>
                        <button className="gmail-toolbar-btn" onClick={() => handleDeleteEmail(selectedEmail.id)} title="Delete email">
                          <Trash2 size={16} />
                        </button>
                        <button className="gmail-toolbar-btn" title="Archive">
                          <Archive size={16} />
                        </button>
                        <span className="gmail-toolbar-divider">|</span>
                        <button className="gmail-toolbar-btn" title="More options">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      
                      <div className="gmail-reader-content">
                        <h1 className="gmail-reader-subject">{selectedEmail.subject}</h1>
                        
                        <div className="gmail-reader-sender-row">
                          <div className="gmail-avatar">
                            {selectedEmail.fromName[0].toUpperCase()}
                          </div>
                          <div className="gmail-sender-details">
                            <div className="gmail-sender-info">
                              <span className="gmail-sender-display-name">{selectedEmail.fromName}</span>
                              <span className="gmail-sender-address">&lt;{selectedEmail.fromEmail}&gt;</span>
                            </div>
                            <div className="gmail-to-details">
                              to me ▾
                            </div>
                          </div>
                          <div className="gmail-reader-time">
                            {selectedEmail.date}
                          </div>
                        </div>

                        <div 
                          className="gmail-email-body-content" 
                          dangerouslySetInnerHTML={{ __html: selectedEmail.body }} 
                        />

                        <div className="gmail-reply-box">
                          <button className="gmail-reply-btn"><CornerUpLeft size={14} /> Reply</button>
                          <button className="gmail-reply-btn"><CornerUpRight size={14} /> Forward</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="email-reader-placeholder gmail-placeholder">
                      <Mail size={48} className="envelope-icon" style={{ opacity: 0.5 }} />
                      <p>Select an item to read</p>
                      <small style={{ opacity: 0.6 }}>Nothing is selected</small>
                    </div>
                  )}
                </div>
              </div>
            )}

            {dashboardSidebarTab === 'applied' && (
              <div className="applied-jobs-box">
                <h3>Autonomously Applied Positions</h3>
                {appliedJobs.length === 0 ? (
                  <div className="applied-empty-state">No applied positions yet. Upload a matching resume (Score &ge; 80) to apply.</div>
                ) : (
                  <>
                    <div className="table-controls-bar">
                      <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search by job title or company..."
                          value={appliedSearchQuery}
                          onChange={(e) => setAppliedSearchQuery(e.target.value)}
                          className="table-search-input"
                        />
                      </div>
                      <div className="filter-wrapper">
                        <span className="filter-label">Status:</span>
                        <select
                          value={appliedStatusFilter}
                          onChange={(e) => setAppliedStatusFilter(e.target.value)}
                          className="table-filter-select"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {filteredJobs.length === 0 ? (
                      <div className="table-no-results">
                        <AlertTriangle size={24} style={{ color: '#f57c00', marginBottom: '8px' }} />
                        <p>No matching positions found.</p>
                        <small>Try adjusting your search query or status filter.</small>
                      </div>
                    ) : (
                      <div className="jobs-table-container">
                        <table className="jobs-table">
                          <thead>
                            <tr>
                              <th style={{ width: '60px' }}>#</th>
                              <th>Job Title</th>
                              <th>Company</th>
                              <th>Location</th>
                              <th>Status</th>
                              <th style={{ width: '220px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredJobs.map((app, i) => {
                              const displayStatus = getDisplayStatus(app, i);
                              const originalPostingUrl = app.jobUrl || `https://www.google.com/search?q=${encodeURIComponent(app.jobTitle + ' ' + app.company + ' jobs')}`;
                              return (
                                <tr key={app._id || i}>
                                  <td className="serial-col"><strong>{i + 1}</strong></td>
                                  <td><strong>{app.jobTitle}</strong></td>
                                  <td>{app.company}</td>
                                  <td>{app.location || 'Remote'}</td>
                                  <td className="status-col">{renderStatusBadge(displayStatus)}</td>
                                  <td>
                                    <div className="table-actions-cell">
                                      <button
                                        className="view-letter-btn"
                                        onClick={() => {
                                          setSelectedCoverLetter(app.coverLetter);
                                          setSelectedJobTitle(app.jobTitle);
                                          setShowCoverLetterModal(true);
                                        }}
                                      >
                                        Cover Letter
                                      </button>
                                      <a
                                        href={originalPostingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="job-external-link-btn"
                                        title="View Original Posting"
                                      >
                                        <ExternalLink size={14} /> Job Post
                                      </a>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ===== ANALYTICS TAB ===== */}
            {dashboardSidebarTab === 'analytics' && (() => {
              // --- Date filter ---
              const now = new Date();
              const daysBack = analyticsDateRange === 'all' ? Infinity : parseInt(analyticsDateRange);
              const cutoff = analyticsDateRange === 'all' ? new Date(0) : new Date(now - daysBack * 86400000);

              const filtered = appliedJobs.filter(app => {
                const matchDate = new Date(app.appliedAt || Date.now()) >= cutoff;
                const matchCompany = analyticsCompanyFilter === '' ||
                  app.company.toLowerCase().includes(analyticsCompanyFilter.toLowerCase());
                return matchDate && matchCompany;
              });

              // --- KPI calculations ---
              const totalApplied = filtered.length;
              const latestAts = atsScore ?? 0;
              const statusCounts = filtered.reduce((acc, app, idx) => {
                const s = getDisplayStatus(app, idx).toLowerCase();
                acc[s] = (acc[s] || 0) + 1;
                return acc;
              }, {});
              const interviewCount = (statusCounts['interviewing'] || 0);
              const rejectedCount  = (statusCounts['rejected'] || 0);
              const rejectionRate  = totalApplied > 0 ? Math.round((rejectedCount / totalApplied) * 100) : 0;

              // --- Timeline: group by date (last N days) ---
              const buckets = {};
              const labelCount = Math.min(daysBack === Infinity ? 30 : daysBack, 30);
              for (let i = labelCount - 1; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                buckets[key] = 0;
              }
              filtered.forEach(app => {
                const d = new Date(app.appliedAt || Date.now());
                if (d >= cutoff) {
                  const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  if (key in buckets) buckets[key]++;
                }
              });
              const timelineKeys  = Object.keys(buckets);
              const timelineVals  = Object.values(buckets);
              const maxVal        = Math.max(...timelineVals, 1);

              // --- Donut segments ---
              const donutData = [
                { label: 'Applied',      count: statusCounts['applied']      || 0, color: '#4fc3f7' },
                { label: 'Under Review', count: statusCounts['under review']  || 0, color: '#f57c00' },
                { label: 'Interviewing', count: statusCounts['interviewing']  || 0, color: '#66bb6a' },
                { label: 'Rejected',     count: statusCounts['rejected']      || 0, color: '#ef5350' },
              ].filter(d => d.count > 0);
              const donutTotal    = donutData.reduce((s, d) => s + d.count, 0) || 1;
              const r = 52, cx = 70, cy = 70, circumference = 2 * Math.PI * r;
              let donutOffset = 0;
              const donutSegments = donutData.map(seg => {
                const pct    = seg.count / donutTotal;
                const dash   = pct * circumference;
                const gap    = circumference - dash;
                const seg_el = { ...seg, dash, gap, offset: donutOffset };
                donutOffset += dash;
                return seg_el;
              });

              // --- Top Companies ---
              const companyCounts = {};
              filtered.forEach(app => { companyCounts[app.company] = (companyCounts[app.company] || 0) + 1; });
              const topCompanies  = Object.entries(companyCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8);
              const maxCompany    = topCompanies[0]?.[1] || 1;

              return (
                <div className="analytics-container">
                  {/* Filter Bar */}
                  <div className="analytics-filter-bar">
                    <div className="analytics-filter-group">
                      <label className="analytics-filter-label">Date Range</label>
                      <div className="analytics-date-pills">
                        {[['7','7 Days'],['14','14 Days'],['30','30 Days'],['all','All Time']].map(([val, label]) => (
                          <button
                            key={val}
                            className={`analytics-date-pill ${analyticsDateRange === val ? 'active' : ''}`}
                            onClick={() => setAnalyticsDateRange(val)}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="analytics-filter-group">
                      <label className="analytics-filter-label">Company</label>
                      <div className="analytics-search-wrap">
                        <Search size={14} className="analytics-search-icon" />
                        <input
                          className="analytics-search-input"
                          placeholder="Filter by company..."
                          value={analyticsCompanyFilter}
                          onChange={e => setAnalyticsCompanyFilter(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="analytics-kpi-row">
                    <div className="analytics-kpi-card">
                      <div className="kpi-icon" style={{background:'rgba(79,195,247,0.15)'}}><Target size={20} color="#4fc3f7" /></div>
                      <div className="kpi-body">
                        <span className="kpi-value">{totalApplied}</span>
                        <span className="kpi-label">Applications</span>
                      </div>
                    </div>
                    <div className="analytics-kpi-card">
                      <div className="kpi-icon" style={{background:'rgba(245,124,0,0.15)'}}><Award size={20} color="#f57c00" /></div>
                      <div className="kpi-body">
                        <span className="kpi-value">{latestAts > 0 ? `${latestAts}%` : '—'}</span>
                        <span className="kpi-label">Latest ATS Score</span>
                      </div>
                    </div>
                    <div className="analytics-kpi-card">
                      <div className="kpi-icon" style={{background:'rgba(102,187,106,0.15)'}}><TrendingUp size={20} color="#66bb6a" /></div>
                      <div className="kpi-body">
                        <span className="kpi-value">{interviewCount}</span>
                        <span className="kpi-label">Interviewing</span>
                      </div>
                    </div>
                    <div className="analytics-kpi-card">
                      <div className="kpi-icon" style={{background:'rgba(239,83,80,0.15)'}}><AlertTriangle size={20} color="#ef5350" /></div>
                      <div className="kpi-body">
                        <span className="kpi-value">{rejectionRate}%</span>
                        <span className="kpi-label">Rejection Rate</span>
                      </div>
                    </div>
                  </div>

                  {totalApplied === 0 ? (
                    <div className="analytics-empty">
                      <BarChart2 size={48} style={{opacity:0.25, marginBottom:'12px'}} />
                      <p>No application data for the selected period.</p>
                      <small>Apply to jobs and return here to see your insights.</small>
                    </div>
                  ) : (
                    <div className="analytics-chart-grid">
                      {/* Timeline Bar Chart */}
                      <div className="analytics-chart-card">
                        <h4 className="analytics-chart-title"><BarChart2 size={16}/> Applications Over Time</h4>
                        <div className="analytics-bar-chart">
                          {timelineKeys.map((key, i) => (
                            <div key={key} className="analytics-bar-col">
                              <div className="analytics-bar-tooltip">{timelineVals[i]} app{timelineVals[i] !== 1 ? 's' : ''}<br/>{key}</div>
                              <div
                                className="analytics-bar-fill"
                                style={{
                                  height: `${Math.max((timelineVals[i] / maxVal) * 100, timelineVals[i] > 0 ? 6 : 0)}%`,
                                  animationDelay: `${i * 30}ms`
                                }}
                              />
                              {timelineKeys.length <= 14 && <span className="analytics-bar-label">{key}</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Donut Chart */}
                      <div className="analytics-chart-card">
                        <h4 className="analytics-chart-title"><Target size={16}/> Status Breakdown</h4>
                        <div className="analytics-donut-wrap">
                          <svg viewBox="0 0 140 140" className="analytics-donut-svg">
                            {donutSegments.map((seg, i) => (
                              <circle
                                key={i}
                                className="analytics-donut-segment"
                                cx={cx} cy={cy} r={r}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth="18"
                                strokeDasharray={`${seg.dash} ${seg.gap}`}
                                strokeDashoffset={-seg.offset + circumference * 0.25}
                                style={{animationDelay: `${i * 120}ms`}}
                              />
                            ))}
                            <text x={cx} y={cy - 6} textAnchor="middle" className="donut-center-num">{totalApplied}</text>
                            <text x={cx} y={cy + 12} textAnchor="middle" className="donut-center-label">Total</text>
                          </svg>
                          <div className="analytics-donut-legend">
                            {donutData.map(seg => (
                              <div key={seg.label} className="donut-legend-row">
                                <span className="donut-legend-dot" style={{background: seg.color}} />
                                <span className="donut-legend-name">{seg.label}</span>
                                <span className="donut-legend-count">{seg.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top Companies */}
                      <div className="analytics-chart-card analytics-chart-wide">
                        <h4 className="analytics-chart-title"><TrendingUp size={16}/> Top Target Companies</h4>
                        {topCompanies.length === 0 ? (
                          <p className="analytics-sub">No data</p>
                        ) : (
                          <div className="analytics-company-list">
                            {topCompanies.map(([company, count], i) => (
                              <div key={company} className="analytics-company-row">
                                <span className="company-rank">#{i+1}</span>
                                <span className="company-name">{company}</span>
                                <div className="company-bar-track">
                                  <div
                                    className="company-bar-fill"
                                    style={{width:`${(count/maxCompany)*100}%`, animationDelay:`${i*60}ms`}}
                                  />
                                </div>
                                <span className="company-count">{count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          </main>
        </div>
      )}

      {showAuth && (
        <div className="auth-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-card" onClick={e => e.stopPropagation()}>
            <h2>{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleAuth}>
              <input type="email" placeholder="Email" required onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
              <input type="password" placeholder="Password" required onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
              {authMode === 'login' && <p className="forgot-link" onClick={handleForgotPassword}>Forgot Password?</p>}
              <button type="submit" className="auth-btn">Continue</button>
              <div className="social-divider"><span>OR</span></div>
              <GoogleLogin
                onSuccess={async (res) => {
                  const r = await fetch(`${API_BASE}/api/auth/google-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: res.credential })
                  });
                  const d = await r.json();
                  if (d.token) {
                    localStorage.setItem('user', JSON.stringify(d));
                    setUser(d);
                    setShowAuth(false);
                    setMessages([]);
                    setActiveConvId(null);
                    Swal.fire({
                      title: 'Success!',
                      text: 'Logged in',
                      icon: 'success',
                      timer: 1500,
                      showConfirmButton: false,
                      background: theme === 'dark' ? '#232323ff' : '#edededff',
                      color: theme === 'dark' ? '#fff' : '#000'
                    });
                  }
                }}
                onError={() => Swal.fire('Error', 'Google Login Failed', 'error')}
              />
            </form>
            <div className="auth-toggle-box">
              <span className="typing-toggle" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                {authMode === 'login' ? 'Create an account' : 'Already have an account?'}
              </span>
            </div>
          </div>
        </div>
      )}

      {showWarningCard && !user && (
        <div className={`warning-card ${isWarningCardClosing ? 'closing' : ''}`}>
          <div className="warning-card-header">
            <AlertTriangle size={24} className="warning-card-header-icon" />
          </div>
          <div className="warning-card-body">
            <p className="warning-card-text">
              Hi! This project is deployed on Render's free service, so the initial load might take a few moments.
            </p>
            <button className="warning-card-close" onClick={triggerCloseWarningCard}>
              <X size={16} />
            </button>
          </div>
          <div className="warning-card-progress">
            <div className="warning-card-progress-bar" />
          </div>
        </div>
      )}

      {/* Job Dashboard Modal Removed - Migrated to full-page dashboard view */}

      {/* Cover Letter Sub-Modal */}
      {showCoverLetterModal && (
        <div className="cover-letter-overlay" onClick={() => setShowCoverLetterModal(false)}>
          <div className="cover-letter-card" onClick={e => e.stopPropagation()}>
            <button className="cover-letter-close" onClick={() => setShowCoverLetterModal(false)}>×</button>
            <h3>Bespoke Cover Letter: {selectedJobTitle}</h3>
            <pre className="cover-letter-content">{selectedCoverLetter}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <span className="lang-label">{language || 'code'}</span>
        <button onClick={handleCopy} className="copy-btn">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '15px', background: 'transparent' }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default App;
