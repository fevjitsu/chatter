// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStripeContext } from '../context/StripeContext';
import { 
  Edit, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Shield,
  Store,
  ShoppingBag,
  Heart,
  Share,
  MoreHorizontal,
  Camera,
  X,
  CreditCard,
  BarChart3,
  Settings,
  UserCheck,
  Globe,
  Lock
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { getPaymentHistory } = useStripeContext();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarImage, setAvatarImage] = useState(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Load user data and content
  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        const [posts, products, payments] = await Promise.all([
          loadUserPosts(),
          loadUserProducts(),
          loadPaymentHistory()
        ]);

        setUserPosts(posts);
        setUserProducts(products);
        setPaymentHistory(payments);

        // Set profile data
        setProfileData({
          name: user.displayName || user.email.split('@')[0],
          username: user.email.split('@')[0],
          bio: 'Digital creator and entrepreneur. Passionate about tech and innovation. ✨',
          location: 'San Francisco, CA',
          website: 'https://mysite.com',
          joinDate: 'January 2023',
          followers: 1248,
          following: 563,
          totalSales: 42,
          rating: 4.8
        });

      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user]);

  // Mock data loading functions
  const loadUserPosts = async () => {
    return [
      {
        id: 1,
        content: 'Just launched my new product line! Check out the amazing features and special launch discounts. #NewProduct #Launch',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        likes: 124,
        comments: 23,
        retweets: 45,
        type: 'post'
      },
      {
        id: 2,
        content: 'Great meeting with investors today. Exciting things coming soon for our platform! 🚀',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        likes: 89,
        comments: 12,
        retweets: 23,
        type: 'post'
      },
      {
        id: 3,
        content: 'Special weekend sale! 30% off on all electronics. Limited time offer!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        likes: 267,
        comments: 34,
        retweets: 89,
        type: 'promotion'
      }
    ];
  };

  const loadUserProducts = async () => {
    return [
      {
        id: 1,
        name: 'Wireless Smart Headphones',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        category: 'Electronics',
        stock: 45,
        sales: 123,
        rating: 4.8,
        status: 'active'
      },
      {
        id: 2,
        name: 'Organic Coffee Beans Pack',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=300',
        category: 'Food & Beverage',
        stock: 89,
        sales: 67,
        rating: 4.5,
        status: 'active'
      },
      {
        id: 3,
        name: 'Fitness Tracker Watch',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        category: 'Wearables',
        stock: 0,
        sales: 234,
        rating: 4.9,
        status: 'out_of_stock'
      }
    ];
  };

  const loadPaymentHistory = async () => {
    try {
      const history = await getPaymentHistory(10);
      return history.payments || [];
    } catch (error) {
      console.error('Error loading payment history:', error);
      return mockPaymentHistory;
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    // Here you would typically update the profile in your backend
    console.log('Updating profile:', profileData);
    setIsEditing(false);
    setShowEditModal(false);
  };

  // Handle image upload
  const handleImageUpload = (type, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'avatar') {
        setAvatarImage(e.target.result);
      } else {
        setCoverImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Sales',
      value: profileData.totalSales || 0,
      icon: ShoppingBag,
      color: '#00ba7c',
      description: 'Products sold'
    },
    {
      title: 'Store Rating',
      value: profileData.rating || 0,
      icon: Heart,
      color: '#f91880',
      description: 'Average rating'
    },
    {
      title: 'Followers',
      value: profileData.followers || 0,
      icon: UserCheck,
      color: '#1d9bf0',
      description: 'People following'
    },
    {
      title: 'Revenue',
      value: '$4,287',
      icon: CreditCard,
      color: '#8b5cf6',
      description: 'Total earnings'
    }
  ];

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Cover Photo */}
        <div className="profile-cover">
          <div 
            className="cover-image"
            style={{
              backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <button 
              className="edit-cover-btn"
              onClick={() => coverInputRef.current?.click()}
            >
              <Camera size={20} />
              Edit Cover
            </button>
            <input
              type="file"
              ref={coverInputRef}
              onChange={(e) => e.target.files[0] && handleImageUpload('cover', e.target.files[0])}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img 
                src={avatarImage || user.photoURL || '/default-avatar.png'} 
                alt={profileData.name}
                className="profile-avatar"
              />
              <button 
                className="edit-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files[0] && handleImageUpload('avatar', e.target.files[0])}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="profile-actions">
              <button 
                className="edit-profile-btn"
                onClick={() => setShowEditModal(true)}
              >
                <Edit size={16} />
                Edit Profile
              </button>
              <button className="share-profile-btn">
                <Share size={16} />
              </button>
              <button className="more-options-btn">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          <div className="profile-info">
            <div className="name-section">
              <h1 className="profile-name">{profileData.name}</h1>
              {user.emailVerified && <span className="verified-badge">✓ Verified</span>}
            </div>
            
            <p className="profile-username">@{profileData.username}</p>
            
            <p className="profile-bio">{profileData.bio}</p>

            <div className="profile-details">
              <div className="detail-item">
                <MapPin size={16} />
                <span>{profileData.location}</span>
              </div>
              <div className="detail-item">
                <LinkIcon size={16} />
                <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                  {profileData.website}
                </a>
              </div>
              <div className="detail-item">
                <Calendar size={16} />
                <span>Joined {profileData.joinDate}</span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{profileData.following}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profileData.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profileData.totalSales}</span>
                <span className="stat-label">Sales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {statsCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`tab ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            Media
          </button>
          <button 
            className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="posts-tab">
              {userPosts.map(post => (
                <div key={post.id} className="profile-post">
                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.image && (
                      <div className="post-image">
                        <img src={post.image} alt="Post content" />
                      </div>
                    )}
                  </div>
                  <div className="post-meta">
                    <span className="post-time">
                      {formatTime(post.timestamp)}
                    </span>
                    <div className="post-stats">
                      <span>{post.likes} Likes</span>
                      <span>{post.comments} Comments</span>
                      <span>{post.retweets} Retweets</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="products-tab">
              <div className="products-grid">
                {userProducts.map(product => (
                  <div key={product.id} className="product-item">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      <div className={`product-status ${product.status}`}>
                        {product.status === 'active' ? 'Active' : 'Out of Stock'}
                      </div>
                    </div>
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p className="product-category">{product.category}</p>
                      <div className="product-price">${product.price}</div>
                      <div className="product-stats">
                        <span>⭐ {product.rating}</span>
                        <span>🛒 {product.sales} sold</span>
                        <span>📦 {product.stock} left</span>
                      </div>
                    </div>
                    <div className="product-actions">
                      <button className="edit-product-btn">
                        <Edit size={16} />
                      </button>
                      <button className="view-product-btn">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="payments-tab">
              <div className="payments-header">
                <h3>Payment History</h3>
                <button className="export-btn">Export CSV</button>
              </div>
              <div className="payments-list">
                {paymentHistory.map(payment => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-info">
                      <div className="payment-amount">${payment.amount}</div>
                      <div className="payment-description">{payment.description}</div>
                      <div className="payment-date">{formatDate(payment.timestamp)}</div>
                    </div>
                    <div className={`payment-status ${payment.status}`}>
                      {payment.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Store Performance</h4>
                  <div className="metric">
                    <span className="metric-value">124</span>
                    <span className="metric-label">Total Views</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">42</span>
                    <span className="metric-label">Products Sold</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">$4,287</span>
                    <span className="metric-label">Total Revenue</span>
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>Engagement</h4>
                  <div className="metric">
                    <span className="metric-value">34%</span>
                    <span className="metric-label">Conversion Rate</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">4.8</span>
                    <span className="metric-label">Average Rating</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">89%</span>
                    <span className="metric-label">Customer Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="edit-form">
              <div className="form-section">
                <label>Profile Picture</label>
                <div className="avatar-upload">
                  <img 
                    src={avatarImage || user.photoURL || '/default-avatar.png'} 
                    alt="Current avatar"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="change-avatar-btn"
                  >
                    Change Photo
                  </button>
                </div>
              </div>

              <div className="form-section">
                <label>Cover Photo</label>
                <div className="cover-upload">
                  <div 
                    className="cover-preview"
                    style={{
                      backgroundImage: coverImage ? `url(${coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="change-cover-btn"
                  >
                    Change Cover
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us about yourself"
                  maxLength={160}
                />
                <span className="char-count">{profileData.bio?.length || 0}/160</span>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="Where are you located?"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const formatTime = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInHours = (now - postTime) / (1000 * 60 * 60);

  if (diffInHours < 1) return `${Math.floor(diffInHours * 60)}m ago`;
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Mock payment history
const mockPaymentHistory = [
  {
    id: 1,
    amount: 199.99,
    description: 'Wireless Headphones Sale',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: 2,
    amount: 24.99,
    description: 'Coffee Beans Pack',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48)
  },
  {
    id: 3,
    amount: 149.99,
    description: 'Fitness Tracker',
    status: 'refunded',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72)
  }
];

export default Profile;