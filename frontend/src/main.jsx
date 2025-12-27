import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="302999478006-b74kqht2au61f4u9kqnakeadn31fil9u.apps.googleusercontent.com"> 
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
