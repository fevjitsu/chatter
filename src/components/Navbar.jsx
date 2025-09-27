// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStripeContext } from '../context/StripeContext';
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  User, 
  ShoppingCart, 
  Store, 
  LogOut,
  Settings,
  CreditCard,
  Menu,
  X,
  TrendingUp
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { createPortalSession } = useStripeContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(3); // Mock data
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock cart items count - replace with actual cart context
  useEffect(() => {
    // This would typically come from a CartContext
    setCartItemsCount(2); // Mock data
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle billing portal redirection
  const handleBillingPortal = async () => {
    try {
      const session = await createPortalSession(window.location.href);
      window.location.href = session.url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Unable to open billing portal. Please try again.');
    }
  };

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items for authenticated users
  const navItems = [
    { path: '/', icon: Home, label: 'Home', requiresAuth: true },
    { path: '/explore', icon: Search, label: 'Explore', requiresAuth: true },
    { path: '/store', icon: Store, label: 'My Store', requiresAuth: true, requiresVerification: true },
    { path: '/ads', icon: TrendingUp, label: 'Ads Manager', requiresAuth: true, requiresVerification: true },
  ];

  // User menu items
  const userMenuItems = [
    { icon: User, label: 'Profile', path: '/profile', action: () => navigate('/profile') },
    { icon: CreditCard, label: 'Billing', action: handleBillingPortal },
    { icon: Settings, label: 'Settings', path: '/settings', action: () => navigate('/settings') },
    { icon: LogOut, label: 'Logout', action: handleLogout, isDestructive: true },
  ];

  // Notification items - mock data
  const notificationItems = [
    { id: 1, text: 'Your order has been shipped', time: '5 min ago', read: false },
    { id: 2, text: 'New follower: @johndoe', time: '1 hour ago', read: false },
    { id: 3, text: 'Payment received for Product XYZ', time: '2 hours ago', read: true },
  ];

  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">🐦</div>
            <span className="logo-text">CommerceTweet</span>
          </Link>

          {/* Auth Links */}
          <div className="navbar-auth-links">
            <Link to="/login" className="auth-link login-link">
              Sign In
            </Link>
            <Link to="/login" className="auth-link signup-link">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🐦</div>
          <span className="logo-text">CommerceTweet</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav-desktop">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = isActive(item.path);
            
            // Check if user meets requirements for this item
            const canAccess = !item.requiresVerification || user.emailVerified;
            
            if (!canAccess) return null;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isItemActive ? 'active' : ''}`}
              >
                <Icon size={24} />
                <span className="nav-label">{item.label}</span>
                {isItemActive && <div className="active-indicator" />}
              </Link>
            );
          })}
        </div>

        {/* Right Section - Icons and User Menu */}
        <div className="navbar-right">
          {/* Notifications */}
          <div className="nav-icon-wrapper">
            <button className="nav-icon">
              <Bell size={22} />
              {notificationsCount > 0 && (
                <span className="notification-badge">{notificationsCount}</span>
              )}
            </button>
          </div>

          {/* Messages */}
          <div className="nav-icon-wrapper">
            <button className="nav-icon">
              <Mail size={22} />
            </button>
          </div>

          {/* Shopping Cart */}
          <div className="nav-icon-wrapper">
            <Link to="/cart" className="nav-icon">
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </Link>
          </div>

          {/* User Menu */}
          <div className="user-menu-wrapper" ref={dropdownRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName || 'User'}
                className="user-avatar"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div className="user-info">
                <span className="user-name">
                  {user.displayName || user.email.split('@')[0]}
                </span>
                {user.emailVerified && (
                  <span className="verified-badge">Verified</span>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName || 'User'}
                    className="dropdown-avatar"
                  />
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">
                      {user.displayName || 'User'}
                    </div>
                    <div className="dropdown-user-email">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {userMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsDropdownOpen(false);
                    }}
                    className={`dropdown-item ${item.isDestructive ? 'destructive' : ''}`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="dropdown-divider" />

                {/* Store Status */}
                <div className="store-status">
                  <div className="status-label">Store Status</div>
                  <div className={`status-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                    {user.emailVerified ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <div className="mobile-menu">
              {/* Mobile Menu Header */}
              <div className="mobile-menu-header">
                <div className="mobile-user-info">
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName || 'User'}
                    className="mobile-user-avatar"
                  />
                  <div>
                    <div className="mobile-user-name">
                      {user.displayName || user.email.split('@')[0]}
                    </div>
                    <div className="mobile-user-email">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-close-btn"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="mobile-nav-items">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = isActive(item.path);
                  const canAccess = !item.requiresVerification || user.emailVerified;

                  if (!canAccess) return null;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`mobile-nav-item ${isItemActive ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={24} />
                      <span>{item.label}</span>
                      {isItemActive && <div className="mobile-active-indicator" />}
                    </Link>
                  );
                })}

                {/* Mobile User Menu Items */}
                {userMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`mobile-nav-item ${item.isDestructive ? 'destructive' : ''}`}
                  >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="mobile-menu-footer">
                <div className="store-status-mobile">
                  <Store size={18} />
                  <span>Store: </span>
                  <span className={`status-mobile ${user.emailVerified ? 'verified' : 'unverified'}`}>
                    {user.emailVerified ? 'Active' : 'Verification Required'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;