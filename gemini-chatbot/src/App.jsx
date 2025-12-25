import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoSend } from "react-icons/io5";
import { 
  Paperclip, 
  Search, 
  GraduationCap, 
  Image as ImageIcon, 
  Mic, 
  Plus,
  Trash2
} from 'lucide-react'; 
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const chatEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // Load conversations on mount or user change
  // Load conversation LIST on mount or user change
  useEffect(() => {
    if (user) {
      fetch('http://localhost:5000/api/conversations', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setConversations(data); });
    }
  }, [user]); // Removed activeConvId from here to prevent unnecessary list refreshes

  // NEW: Load specific MESSAGE HISTORY when a conversation is selected
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user && activeConvId) {
        try {
          const res = await fetch(`http://localhost:5000/api/conversations/${activeConvId}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          const data = await res.json();
          // Assuming your backend returns an array of messages or an object with a messages array
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

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Logout with confirmation alert
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem('user');
      setUser(null);
      setMessages([]);
      setActiveConvId(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setIsLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user) headers['Authorization'] = `Bearer ${user.token}`;
      
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ message: input, conversationId: activeConvId }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
      if (user && !activeConvId) setActiveConvId(data.conversationId);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleDeleteConversation = async (e, id) => {
  e.stopPropagation(); // Prevents the chat from being selected when clicking delete
  
  if (!window.confirm("Delete this conversation?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/conversations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });

    if (res.ok) {
      // Remove from local list
      setConversations(prev => prev.filter(c => c._id !== id));
      // If we deleted the current active chat, clear the view
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
    }
  } catch (err) {
    console.error("Failed to delete:", err);
  }
};

  const handleAuth = async (e) => {
    e.preventDefault();
    const url = authMode === 'login' ? 'login' : 'signup';
    const res = await fetch(`http://localhost:5000/api/auth/${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setShowAuth(false);
    } else if (authMode === 'signup') {
      alert("Registration successful! Now Login.");
      setAuthMode('login');
    } else { 
      alert(data.error); 
    }
  };

  return (
    <div className="chatgpt-main">
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
          <button className="new-chat-btn" onClick={() => { setMessages([]); setActiveConvId(null); }}>
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
                <button 
                  className="delete-btn" 
                  onClick={(e) => handleDeleteConversation(e, c._id)}
                >
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
                
                {/* New Thinking Feature added below */}
                {isLoading && (
                  <div className="msg-row bot">
                    <div className="msg-wrapper">
                      <div className="text-box thinking-text">
                        AI ChatBot is thinking...
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
        </div>

          <div className="input-fixed-bottom">
            <div className="input-pill-container">
              <div className="pill-actions-row">
                <button className="action-pill"><Paperclip size={16} /> Attach</button>
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
                    // Auto-resize logic
                    e.target.style.height = 'auto'; 
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                      // Reset height after sending
                      e.target.style.height = 'auto';
                    }
                  }}
                  placeholder="Ask anything" 
                  rows="1"
                />
                <div className="input-tools">
                  <span className="mic-tool"><Mic size={18} /></span>
                  <button type="submit" className="send-tool" disabled={!input.trim() || isLoading}>
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
              <button type="submit" className="auth-btn">Continue</button>
            </form>
            <div className="auth-toggle-box">
              {authMode === 'login' ? "New here? " : "Existing account? "}
              <span className="typing-toggle" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                {authMode === 'login' ? 'Sign up' : 'Login'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;