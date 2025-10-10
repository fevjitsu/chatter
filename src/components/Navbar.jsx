// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
  TrendingUp,
  Package,
  Heart,
  Users,
  BarChart3,
  Shield,
  Sun,
  Music,
  MapPin,
  ChevronDown,
  StoreIcon
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Update cart items count
  useEffect(() => {
    setCartItemsCount(getCartItemsCount());
  }, [getCartItemsCount]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Check if user is admin
  const isAdmin = user?.email === 'admin@triniconnect.com' || user?.uid === 'admin';

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items for authenticated users
  const navItems = [
    { path: '/', icon: Home, label: 'Home', requiresAuth: true },
    { path: '/explore', icon: Search, label: 'Explore', requiresAuth: true },
    { path: '/store', icon: Store, label: 'My Store', requiresAuth: true, requiresVerification: true },
    { path: '/orders', icon: Package, label: 'Orders', requiresAuth: true },
    { path: '/favorites', icon: Heart, label: 'Favorites', requiresAuth: true },
  ];

  // Admin navigation items
  const adminNavItems = [
    { path: '/admin', icon: Shield, label: 'Admin', requiresAuth: true, requiresAdmin: true },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', requiresAuth: true, requiresAdmin: true },
  ];

  // User menu items
  const userMenuItems = [
    { icon: User, label: 'Profile', path: '/profile', action: () => navigate('/profile') },
    { icon: Package, label: 'My Orders', path: '/orders', action: () => navigate('/orders') },
    { icon: Heart, label: 'Favorites', path: '/favorites', action: () => navigate('/favorites') },
    { icon: StoreIcon, label: 'My Store', path: '/store', action: () => navigate('/store') },
    { icon: CreditCard, label: 'Billing', action: () => navigate('/billing') },
    { icon: Settings, label: 'Settings', path: '/settings', action: () => navigate('/settings') },
  ];

  // Notification items
  const notificationItems = [
    {
      id: 1,
      type: 'order',
      title: 'Order Shipped!',
      message: 'Your order #TRINI-2024-001 has been shipped',
      time: '5 min ago',
      read: false,
      icon: Package,
      color: 'var(--lime-green)'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from Caribbean Crafts',
      time: '1 hour ago',
      read: false,
      icon: Mail,
      color: 'var(--caribbean-blue)'
    },
    {
      id: 3,
      type: 'promo',
      title: 'Special Offer',
      message: '20% off on all handmade items this weekend',
      time: '2 hours ago',
      read: true,
      icon: TrendingUp,
      color: 'var(--carnival-pink)'
    }
  ];

  if (!user) {
    return (
      <nav className="navbar caribbean-nav">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">🇹🇹</div>
            <div className="logo-text">
              <span className="logo-main">TriniConnect</span>
              <span className="logo-tagline">De Caribbean Social Marketplace</span>
            </div>
          </Link>

          {/* Auth Links */}
          <div className="navbar-auth-links">
            <Link to="/login" className="auth-link login-link caribbean-button-secondary">
              Sign In
            </Link>
            <Link to="/login" className="auth-link signup-link caribbean-button">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar caribbean-nav">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🇹🇹</div>
          <div className="logo-text">
            <span className="logo-main">TriniConnect</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="navbar-search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search products, stores, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav-desktop">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = isActive(item.path);
            
            // Check if user meets requirements for this item
            const canAccess = (!item.requiresVerification || user.emailVerified) && 
                             (!item.requiresAdmin || isAdmin);
            
            if (!canAccess) return null;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item caribbean-nav-item ${isItemActive ? 'active' : ''}`}
              >
                <Icon size={22} />
                <span className="nav-label">{item.label}</span>
                {isItemActive && <div className="active-indicator" />}
              </Link>
            );
          })}

          {/* Admin Links */}
          {isAdmin && adminNavItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item caribbean-nav-item admin-nav-item ${isItemActive ? 'active' : ''}`}
              >
                <Icon size={22} />
                <span className="nav-label">{item.label}</span>
                {isItemActive && <div className="active-indicator" />}
              </Link>
            );
          })}
        </div>

        {/* Right Section - Icons and User Menu */}
        <div className="navbar-right">
          {/* Search Icon (Mobile) */}
          <div className="nav-icon-wrapper mobile-only">
            <button 
              className="nav-icon"
              onClick={() => navigate('/search')}
            >
              <Search size={22} />
            </button>
          </div>

          {/* Notifications */}
          <div className="nav-icon-wrapper" ref={notificationsRef}>
            <button 
              className="nav-icon"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={22} />
              {notificationsCount > 0 && (
                <span className="notification-badge caribbean-badge">
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <span className="notifications-count">{notificationsCount} new</span>
                </div>
                
                <div className="notifications-list">
                  {notificationItems.map(notification => {
                    const Icon = notification.icon;
                    return (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      >
                        <div className="notification-icon" style={{ color: notification.color }}>
                          <Icon size={18} />
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                        {!notification.read && <div className="unread-dot"></div>}
                      </div>
                    );
                  })}
                </div>

                <div className="notifications-footer">
                  <button className="view-all-btn">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="nav-icon-wrapper">
            <Link to="/messages" className="nav-icon">
              <Mail size={22} />
              <span className="message-badge caribbean-badge">2</span>
            </Link>
          </div>

          {/* Shopping Cart */}
          <div className="nav-icon-wrapper">
            <Link to="/cart" className="nav-icon">
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <span className="cart-badge caribbean-badge">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
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
                <span className="user-status">
                  {user.emailVerified && (
                    <span className="verified-badge">
                      <Shield size={12} />
                      Verified
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown size={16} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
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
                    <div className="user-stats">
                      <span>{cartItemsCount} in cart</span>
                      <span>•</span>
                      <span>12 orders</span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* User Menu Items */}
                <div className="dropdown-items">
                  {userMenuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        item.action();
                        setIsDropdownOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Admin Section */}
                {isAdmin && (
                  <>
                    <div className="dropdown-divider" />
                    <div className="dropdown-section-label">Admin</div>
                    <div className="dropdown-items">
                      <button 
                        onClick={() => {
                          navigate('/admin');
                          setIsDropdownOpen(false);
                        }}
                        className="dropdown-item admin-item"
                      >
                        <Shield size={18} />
                        <span>Admin Dashboard</span>
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/analytics');
                          setIsDropdownOpen(false);
                        }}
                        className="dropdown-item admin-item"
                      >
                        <BarChart3 size={18} />
                        <span>Analytics</span>
                      </button>
                    </div>
                  </>
                )}

                <div className="dropdown-divider" />

                {/* Store Status */}
                <div className="store-status">
                  <div className="status-label">Store Status</div>
                  <div className={`status-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                    {user.emailVerified ? (
                      <>
                        <Store size={14} />
                        Active
                      </>
                    ) : (
                      <>
                        <Store size={14} />
                        Inactive
                      </>
                    )}
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-item"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
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
                    {user.emailVerified && (
                      <div className="mobile-verified-badge">
                        <Shield size={14} />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-close-btn"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="mobile-search">
                <form onSubmit={handleSearch} className="mobile-search-form">
                  <div className="mobile-search-input-container">
                    <Search size={20} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mobile-search-input"
                    />
                  </div>
                </form>
              </div>

              {/* Mobile Navigation Items */}
              <div className="mobile-nav-items">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = isActive(item.path);
                  const canAccess = (!item.requiresVerification || user.emailVerified) && 
                                   (!item.requiresAdmin || isAdmin);

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

                {/* Admin Mobile Links */}
                {isAdmin && adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`mobile-nav-item admin-nav-item ${isItemActive ? 'active' : ''}`}
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
                    className="mobile-nav-item"
                  >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                  </button>
                ))}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="mobile-nav-item logout-item"
                >
                  <LogOut size={24} />
                  <span>Logout</span>
                </button>
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
                <div className="mobile-cart-count">
                  <ShoppingCart size={18} />
                  <span>{cartItemsCount} items in cart</span>
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