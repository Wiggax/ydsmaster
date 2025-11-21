import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Set base URL for mobile device testing
// Replace with your computer's local IP address
axios.defaults.baseURL = 'http://10.100.228.29:3000';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
