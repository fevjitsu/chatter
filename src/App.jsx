// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StripeProvider } from './context/StripeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import ProtectedRoute from './components/ProtectedRoute';
import CaribbeanBackground from './components/CaribbeanBackground';
import './styles/theme.css';
import './styles/App.css';
import './styles/Cart.css';
import './styles/Orders.css';
import './styles/Navbar.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <StripeProvider>
          <CartProvider>
            <div className="app">
              <CaribbeanBackground />
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/store" element={
                    <ProtectedRoute requireVerification>
                      <Store />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin>
                      <Admin />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
            </div>
          </CartProvider>
        </StripeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;