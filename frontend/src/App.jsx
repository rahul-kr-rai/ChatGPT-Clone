import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoSend } from "react-icons/io5";
import { 
  Paperclip, Search, GraduationCap, Image as ImageIcon, Mic, Plus, Trash2, X 
} from 'lucide-react'; 
import Swal from 'sweetalert2';
import { GoogleLogin } from '@react-oauth/google';
import './App.css';

function App() {
  // --- CONFIGURATION ---
  // Switch this to your Render URL when deploying (e.g., "https://your-app.onrender.com")
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

  // File Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const chatEndRef = useRef(null);
  const textAreaRef = useRef(null);

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

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to log out?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10a37f',
      cancelButtonColor: '#444',
      confirmButtonText: 'Yes, Logout',
      background: '#fff',
      color: '#171717'
    });

    if (result.isConfirmed) {
      localStorage.removeItem('user');
      setUser(null);
      setMessages([]);
      setConversations([]);
      setActiveConvId(null);
    }
  };

  // --- File Handling Functions ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  // -------------------------------

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;
    
    const currentMessage = input;
    
    const displayMsg = selectedFile 
      ? `📄 [Uploaded: ${selectedFile.name}]\n\n${currentMessage}` 
      : currentMessage;

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
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
      clearFile();

      if (user && !activeConvId && data.conversationId) {
        setActiveConvId(data.conversationId);
        const newChat = {
          _id: data.conversationId,
          title: currentMessage.substring(0, 30) || "File Upload"
        };
        setConversations(prev => [newChat, ...prev]);
      }
    } catch (err) { 
      console.error(err); 
      setMessages(prev => [...prev, { role: 'bot', text: "Error sending message." }]);
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete Chat?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff3a3a',
      confirmButtonText: 'Yes',
      background: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_BASE}/api/conversations/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        setConversations(prev => prev.filter(c => c._id !== id));
        if (activeConvId === id) {
          setActiveConvId(null);
          setMessages([]);
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConvId(null);
    setInput('');
    clearFile();
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
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
        // FIX: Clear guest messages on successful login
        setMessages([]); 
        setActiveConvId(null);
      } else if (authMode === 'signup' && res.ok) {
        alert("Registration successful! Now Login.");
        setAuthMode('login');
      } else { alert(data.error); }
    } catch(err) { console.error(err); }
  };

  return (
    <div className="chatgpt-main">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
        accept="image/*,application/pdf,text/plain" 
      />

      <nav className="top-navbar">
        <div className="nav-brand">AI ChatBot-1.1<span className="arrow">▾</span></div>
        <div className="nav-actions">
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
        <aside className="chat-sidebar">
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
            )) : <div className="guest-label">Log in to save history</div>}
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

              <div className="pill-actions-row">
                <button className="action-pill" onClick={() => fileInputRef.current.click()}>
                  <Paperclip size={16} /> Attach
                </button>
                <button className="action-pill"><Search size={16} /> Search</button>
                <button className="action-pill"><GraduationCap size={16} /> Study</button>
                <button className="action-pill"><ImageIcon size={16} /> Create image</button>
              </div>
              
              <form onSubmit={handleSendMessage} className="pill-form">
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
                  placeholder={selectedFile ? "Add a caption..." : "Ask anything"}
                  rows="1"
                />
                <div className="input-tools">
                  <span className="mic-tool"><Mic size={18} /></span>
                  <button type="submit" className="send-tool" disabled={(!input.trim() && !selectedFile) || isLoading}>
                    <IoSend size={18} /> 
                  </button>
                </div>
              </form>
            </div>
            <p className="privacy-disclaimer">By messaging AI ChatBot-1.1, you agree to our Terms and Privacy Policy.</p>
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
              
              {authMode === 'login' && (
                <p className="forgot-link" onClick={async () => {
                  const { value: email } = await Swal.fire({
                    title: 'Forgot Password',
                    input: 'email',
                    background: '#171717',
                    color: '#fff',
                    confirmButtonColor: '#10a37f',
                    showCancelButton: true
                  });
                  if (email) {
                    fetch(`${API_BASE}/api/auth/forgot-password`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email })
                    }).then(() => Swal.fire('Sent!', 'Check email', 'success'));
                  }
                }}>Forgot Password?</p>
              )}

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
                    // FIX: Clear guest messages on successful Google login
                    setMessages([]);
                    setActiveConvId(null);
                    Swal.fire({ title: 'Success!', text: 'Logged in', icon: 'success', timer: 1500, showConfirmButton: false });
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
