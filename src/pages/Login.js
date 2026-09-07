import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import '../css/Login.css';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showLoading = (show) => {
    setLoading(show);
  };

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    showLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful! Welcome, ' + (userCredential.user.displayName || userCredential.user.email));
      
      // Store the user's name in localStorage for immediate access
      if (userCredential.user.displayName) {
        localStorage.setItem('userName', userCredential.user.displayName);
      }
      
      // Also store the name from the form if available (for immediate use)
      if (name && name.trim() !== '') {
        localStorage.setItem('userName', name);
      }
      
      // Show welcome intro after successful login
      navigate('/welcome-intro');
    } catch (error) {
      // Handle specific authentication errors
      let errorMessage = 'Login failed: ';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage += 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage += 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage += 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      showLoading(false);
    }
  };

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password) {
      alert('Please enter name, email and password');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    showLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name immediately after registration
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Store the name in localStorage for immediate access
      localStorage.setItem('userName', name);
      
      console.log('Registration successful! Name stored:', name);
      console.log('User displayName after update:', userCredential.user.displayName);
      
      // Show welcome intro after successful registration
      navigate('/welcome-intro');
      
      // Clear the form after successful registration
      setName('');
      setEmail('');
      setPassword('');
      
    } catch (error) {
      let errorMessage = 'Registration failed: ';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage += 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage += 'Password is too weak.';
          break;
        default:
          errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      showLoading(false);
    }
  };

  // ALWAYS render the login form immediately - NO AUTHENTICATION CHECKS
  return (
    <div className="login-container">
      <header>
        <h1>MySizwe</h1>
      </header>
      <main>
        <section id="auth-section">
          <form id="auth-form">
            <div id="logo-container">
              <img src="/images/sizwe_training_logo.jpeg" id="form-logo" alt="Sizwe Training Logo" />
            </div>
            <div className="input-container">
              <label htmlFor="name">Name:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Enter your name" 
                required 
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-container">
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter your email" 
                required 
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-container">
              <label htmlFor="password">Password:</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter your password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div id="auth-buttons">
              <button 
                type="button" 
                id="Login" 
                style={{ flex: 1 }}
                onClick={handleLogin}
                disabled={loading}
              >
                Log In
              </button>
              <button 
                type="button" 
                id="Register"
                onClick={handleRegister}
                disabled={loading}
              >
                Register
              </button>
            </div>
            <div className={`loading ${loading ? 'show' : ''}`} id="loading">
              <div className="spinner"></div>
              <p>Authenticating...</p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Login; 