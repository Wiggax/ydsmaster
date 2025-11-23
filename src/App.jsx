import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardStyle } from '@capacitor/keyboard';
import { Platform } from './utils/platform';
import axios from 'axios';
import { getApiUrl } from './utils/platform';
import './styles/mobile.css';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Reading from './pages/Reading';
import ReadingDetail from './pages/ReadingDetail';
import GameMatch from './pages/GameMatch';
import GameFill from './pages/GameFill';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import ProPurchase from './pages/ProPurchase';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import UserAgreement from './pages/UserAgreement';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  // Initialize native plugins
  useEffect(() => {
    const initializeApp = async () => {
      // Configure axios FIRST
      const apiUrl = getApiUrl();
      axios.defaults.baseURL = apiUrl;
      axios.defaults.timeout = 60000; // 60 second timeout for Render cold starts
      console.log('🔵 Axios baseURL set to:', apiUrl);
      console.log('⏱️ Axios timeout set to: 60 seconds');

      // Add request interceptor for debugging
      axios.interceptors.request.use(request => {
        console.log('🟢 Starting Request:', request.method?.toUpperCase(), request.url);
        return request;
      });

      // Add response interceptor for debugging
      axios.interceptors.response.use(
        response => {
          console.log('✅ Response:', response.status, response.config.url);
          return response;
        },
        error => {
          if (error.code === 'ECONNABORTED') {
            console.error('⏱️ TIMEOUT ERROR - Backend took too long to respond!');
          } else if (error.message === 'Network Error') {
            console.error('🌐 NETWORK ERROR - Cannot reach backend!');
          } else {
            console.error('❌ Request Error:', error.message, error.config?.url);
          }
          return Promise.reject(error);
        }
      );

      if (Platform.isNative()) {
        try {
          // Configure StatusBar
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#1a1a2e' });

          // Configure Keyboard
          await Keyboard.setStyle({ style: KeyboardStyle.Dark });
          await Keyboard.setResizeMode({ mode: 'native' });
        } catch (error) {
          console.error('Error initializing native plugins:', error);
        }
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Legal Pages - Public Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/user-agreement" element={<UserAgreement />} />

          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Protected Routes with Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="flashcards/:type" element={<Flashcards />} />
            <Route path="reading" element={<Reading />} />
            <Route path="reading/:id" element={<ReadingDetail />} />
            <Route path="games/match" element={<GameMatch />} />
            <Route path="/games/fill" element={<GameFill />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="pro" element={<ProPurchase />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
