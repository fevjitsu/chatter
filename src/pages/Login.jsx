// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  signInWithGoogle, 
  handleGoogleRedirect,
  isGoogleRedirectFlow,
  setGoogleRedirectFlow,
  initializeRecaptcha, 
  signInWithPhone, 
  verifyPhoneCode 
} from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  Mail, 
  Lock, 
  Phone, 
  MessageCircle, 
  ArrowLeft,
  Shield,
  Chrome,
  Smartphone,
  Monitor
} from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [googleMethod, setGoogleMethod] = useState('popup'); // 'popup' or 'redirect'

  const { user } = useAuth();
  const recaptchaContainerRef = useRef(null);

  // Handle Google redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      if (isGoogleRedirectFlow()) {
        setLoading(true);
        try {
          const user = await handleGoogleRedirect();
          if (user) {
            setMessage('Successfully signed in with Google!');
            setGoogleRedirectFlow(false);
          }
        } catch (error) {
          console.error('Google redirect error:', error);
          setError('Failed to complete Google sign-in');
          setGoogleRedirectFlow(false);
        } finally {
          setLoading(false);
        }
      }
    };

    handleRedirectResult();
  }, []);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    if (authMethod === 'phone' && recaptchaContainerRef.current) {
      try {
        initializeRecaptcha('recaptcha-container');
        console.log('reCAPTCHA initialized');
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        setError('Failed to initialize security verification');
      }
    }
  }, [authMethod]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  // Handle email/password authentication
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Successfully signed in!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Account created successfully!');
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+1${formattedPhone}`;
      }

      const recaptchaVerifier = window.recaptchaVerifier;
      if (!recaptchaVerifier) {
        throw new Error('Security verification not ready. Please refresh the page.');
      }

      const result = await signInWithPhone(formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setMessage('Verification code sent to your phone!');
      
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!confirmationResult) {
        throw new Error('No verification in progress');
      }

      await verifyPhoneCode(confirmationResult, verificationCode);
      setMessage('Phone verified successfully!');
      
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async (method = 'popup') => {
    setLoading(true);
    setError('');

    try {
      if (method === 'redirect') {
        setGoogleRedirectFlow(true);
      }

      await signInWithGoogle(method);
      if (method === 'popup') {
        setMessage('Successfully signed in with Google!');
      }
    } catch (error) {
      handleAuthError(error);
      setGoogleRedirectFlow(false);
    } finally {
      if (method === 'popup') {
        setLoading(false);
      }
    }
  };

  // Enhanced error handling
  const handleAuthError = (error) => {
    console.error('Authentication error:', error);
    
    switch (error.code) {
      // Email/Password errors
      case 'auth/invalid-email':
        setError('Invalid email address');
        break;
      case 'auth/user-disabled':
        setError('This account has been disabled');
        break;
      case 'auth/user-not-found':
        setError('No account found with this email');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password');
        break;
      case 'auth/email-already-in-use':
        setError('An account with this email already exists');
        break;
      case 'auth/weak-password':
        setError('Password should be at least 6 characters');
        break;
      
      // Phone auth errors
      case 'auth/invalid-phone-number':
        setError('Invalid phone number format');
        break;
      case 'auth/too-many-requests':
        setError('Too many attempts. Please try again later.');
        break;
      case 'auth/quota-exceeded':
        setError('SMS quota exceeded. Please try another method.');
        break;
      case 'auth/invalid-verification-code':
        setError('Invalid verification code');
        break;
      case 'auth/code-expired':
        setError('Verification code expired. Please request a new one.');
        break;
      
      // Google auth errors
      case 'auth/popup-closed-by-user':
        setError('Sign-in was cancelled');
        break;
      case 'auth/popup-blocked':
        setError('Popup was blocked by your browser. Please allow popups for this site.');
        break;
      case 'auth/unauthorized-domain':
        setError('This domain is not authorized for Google sign-in');
        break;
      case 'auth/operation-not-supported-in-this-environment':
        setError('Google sign-in is not supported in this environment');
        break;
      
      // General errors
      default:
        setError(error.message || 'An unexpected error occurred');
    }
  };

  // Reset phone verification flow
  const resetPhoneVerification = () => {
    setConfirmationResult(null);
    setVerificationCode('');
    setPhoneNumber('');
    setMessage('');
    setError('');
    
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
  };

  // Detect mobile device for Google auth method
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card caribbean-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">🇹🇹</div>
              <h2>TriniConnect</h2>
            </div>
            <p className="tagline">De Caribbean Social Marketplace</p>
          </div>

          {/* Auth Method Selection */}
          {!confirmationResult && (
            <div className="auth-method-tabs">
              <button
                className={`tab ${authMethod === 'email' ? 'active' : ''}`}
                onClick={() => setAuthMethod('email')}
              >
                <Mail size={18} />
                Email
              </button>
              <button
                className={`tab ${authMethod === 'phone' ? 'active' : ''}`}
                onClick={() => setAuthMethod('phone')}
              >
                <Phone size={18} />
                Phone
              </button>
              <button
                className={`tab ${authMethod === 'google' ? 'active' : ''}`}
                onClick={() => setAuthMethod('google')}
              >
                <Chrome size={18} />
                Google
              </button>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="error-message caribbean-error">
              <Shield size={16} />
              {error}
            </div>
          )}

          {message && (
            <div className="success-message caribbean-success">
              <Shield size={16} />
              {message}
            </div>
          )}

          {/* reCAPTCHA Container (Hidden) */}
          <div id="recaptcha-container" ref={recaptchaContainerRef} style={{ display: 'none' }}></div>

          {/* Email Authentication Form */}
          {authMethod === 'email' && !confirmationResult && (
            <form onSubmit={handleEmailAuth} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={20} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="caribbean-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={20} />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="caribbean-input"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="caribbean-button login-btn"
              >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </form>
          )}

          {/* Phone Authentication - Send Code */}
          {authMethod === 'phone' && !confirmationResult && (
            <form onSubmit={handlePhoneSubmit} className="auth-form">
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={20} />
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="caribbean-input"
                  />
                </div>
                <small className="input-help">
                  Include country code (e.g., +1 for US/Canada)
                </small>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="caribbean-button login-btn"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* Phone Authentication - Verify Code */}
          {authMethod === 'phone' && confirmationResult && (
            <form onSubmit={handleVerifyCode} className="auth-form">
              <div className="verification-header">
                <button 
                  type="button"
                  onClick={resetPhoneVerification}
                  className="back-button"
                >
                  <ArrowLeft size={16} />
                  Change Number
                </button>
                <h3>Enter Verification Code</h3>
              </div>

              <div className="form-group">
                <label>Verification Code</label>
                <div className="input-with-icon">
                  <MessageCircle size={20} />
                  <input
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="caribbean-input"
                    maxLength={6}
                  />
                </div>
                <small className="input-help">
                  Enter the 6-digit code sent to your phone
                </small>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="caribbean-button login-btn"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {/* Google Authentication */}
          {authMethod === 'google' && !confirmationResult && (
            <div className="google-auth-section">
              <div className="google-method-selector">
                <button
                  className={`google-method-btn ${googleMethod === 'popup' ? 'active' : ''}`}
                  onClick={() => setGoogleMethod('popup')}
                >
                  <Monitor size={18} />
                  Desktop
                </button>
                <button
                  className={`google-method-btn ${googleMethod === 'redirect' ? 'active' : ''}`}
                  onClick={() => setGoogleMethod('redirect')}
                >
                  <Smartphone size={18} />
                  Mobile
                </button>
              </div>

              <button 
                onClick={() => handleGoogleSignIn(googleMethod)}
                disabled={loading}
                className="google-auth-btn"
              >
                <Chrome size={20} />
                {loading ? 'Connecting...' : `Continue with Google (${googleMethod === 'popup' ? 'Popup' : 'Redirect'})`}
              </button>

              <div className="google-auth-info">
                <p>
                  <strong>Popup method:</strong> Opens a new window (recommended for desktop)
                </p>
                <p>
                  <strong>Redirect method:</strong> Redirects to Google (better for mobile)
                </p>
              </div>
            </div>
          )}

          {/* Toggle between Login and Sign Up */}
          {!confirmationResult && authMethod !== 'google' && (
            <div className="auth-toggle">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="toggle-btn"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="security-notice">
            <Shield size={14} />
            <span>Your security is our priority. We use industry-standard encryption.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;