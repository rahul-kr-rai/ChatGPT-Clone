import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoSend } from "react-icons/io5"; 
import { 
  Paperclip, Search, GraduationCap, Image as ImageIcon, Mic, 
  Plus, Trash2, X, Sun, Moon, Square, Menu 
} from 'lucide-react'; 
import Swal from 'sweetalert2';
import { GoogleLogin } from '@react-oauth/google';
import './App.css';

function App() {
  // --- CONFIGURATION ---
  const API_BASE = "http://localhost:10000"; 

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
  
  // Refs
  const chatEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // --- Theme Effect ---
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

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
      .then(data => { if(Array.isArray(data)) setConversations(data); })
      .catch(err => console.error(err));
    }
  }, [user]);

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
  }, [activeConvId, user]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
      background: theme === 'dark' ? '#171717' : '#edededff',
      color: theme === 'dark' ? '#fff' : '#000'
    });

    if (result.isConfirmed) {
      localStorage.removeItem('user');
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
        background: theme === 'dark' ? '#171717' : '#fff',
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
            if(textAreaRef.current) {
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
      background: theme === 'dark' ? '#171717' : '#edededff',
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
          background: theme === 'dark' ? '#171717' : '#edededff', 
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
    } catch(err) { console.error(err); }
  };

  const handleForgotPassword = async () => {
    setShowAuth(false); 
    const bgColor = theme === 'dark' ? '#171717' : '#ffffff'; 
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
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
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

      {showAuth && (
        <div className="auth-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-card" onClick={e => e.stopPropagation()}>
            <h2>{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleAuth}>
              <input type="email" placeholder="Email" required onChange={e => setAuthForm({...authForm, email: e.target.value})} />
              <input type="password" placeholder="Password" required onChange={e => setAuthForm({...authForm, password: e.target.value})} />
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
                      background: theme === 'dark' ? '#171717' : '#edededff',
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
    </div>
  );
}

export default App;
