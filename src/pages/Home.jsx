// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  ShoppingCart, 
  MoreHorizontal,
  Image as ImageIcon,
  MapPin,
  Calendar,
  X,
  Filter,
  TrendingUp
} from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forYou');
  const [showProductModal, setShowProductModal] = useState(false);
  const fileInputRef = useRef(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPosts(mockPosts);
        setIsLoading(false);
      }, 1000);
    };

    loadPosts();
  }, []);

  // Handle new post submission
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedImage) return;

    const newPostObj = {
      id: Date.now().toString(),
      user: {
        name: user.displayName || 'User',
        username: user.email.split('@')[0],
        avatar: user.photoURL || '/default-avatar.png',
        verified: user.emailVerified
      },
      content: newPost,
      image: selectedImage,
      timestamp: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      comments: 0,
      isLiked: false,
      isRetweeted: false,
      type: 'post'
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
    setSelectedImage(null);
    
    // Here you would typically send to your backend
    console.log('New post:', newPostObj);
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle like action
  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  // Handle retweet action
  const handleRetweet = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            retweets: post.isRetweeted ? post.retweets - 1 : post.retweets + 1,
            isRetweeted: !post.isRetweeted 
          }
        : post
    ));
  };

  // Handle add to cart for product posts
  const handleAddToCart = (product) => {
    // This would typically update a cart context
    console.log('Added to cart:', product);
    alert(`Added ${product.name} to cart!`);
  };

  // Trending products data
  const trendingProducts = [
    {
      id: 1,
      name: 'Wireless Earbuds Pro',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=150',
      rating: 4.5,
      sales: 1243
    },
    {
      id: 2,
      name: 'Smart Watch Series X',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150',
      rating: 4.8,
      sales: 892
    },
    {
      id: 3,
      name: 'Organic Coffee Beans',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=150',
      rating: 4.3,
      sales: 567
    }
  ];

  // Who to follow suggestions
  const suggestedUsers = [
    {
      id: 1,
      name: 'Tech Gadgets',
      username: '@techgadgets',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100',
      verified: true
    },
    {
      id: 2,
      name: 'Fashion Store',
      username: '@fashionstore',
      avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100',
      verified: true
    },
    {
      id: 3,
      name: 'Home & Garden',
      username: '@homegarden',
      avatar: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100',
      verified: false
    }
  ];

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="home-loading">
          <div className="loading-spinner"></div>
          <p>Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Main Content */}
        <div className="home-main">
          {/* Header */}
          <div className="home-header">
            <div className="header-tabs">
              <button 
                className={`tab ${activeTab === 'forYou' ? 'active' : ''}`}
                onClick={() => setActiveTab('forYou')}
              >
                For You
              </button>
              <button 
                className={`tab ${activeTab === 'following' ? 'active' : ''}`}
                onClick={() => setActiveTab('following')}
              >
                Following
              </button>
              <button 
                className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Products
              </button>
            </div>
          </div>

          {/* Create Post */}
          <div className="create-post">
            <div className="post-user-avatar">
              <img 
                src={user.photoURL || '/default-avatar.png'} 
                alt={user.displayName || 'User'} 
              />
            </div>
            <form onSubmit={handleSubmitPost} className="post-form">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening?"
                maxLength={280}
                className="post-input"
              />
              
              {selectedImage && (
                <div className="post-image-preview">
                  <img src={selectedImage} alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="remove-image-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="post-actions">
                <div className="action-buttons">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="action-btn"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button type="button" className="action-btn">
                    <MapPin size={20} />
                  </button>
                  <button type="button" className="action-btn">
                    <Calendar size={20} />
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={!newPost.trim() && !selectedImage}
                  className="post-submit-btn"
                >
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.map((post) => (
              <div key={post.id} className={`post-card ${post.type === 'ad' ? 'ad-post' : ''}`}>
                {post.type === 'ad' && (
                  <div className="ad-badge">
                    <TrendingUp size={12} />
                    <span>Sponsored</span>
                  </div>
                )}
                
                <div className="post-content">
                  <div className="post-avatar">
                    <img src={post.user.avatar} alt={post.user.name} />
                  </div>
                  
                  <div className="post-body">
                    <div className="post-header">
                      <div className="post-user-info">
                        <span className="user-name">{post.user.name}</span>
                        {post.user.verified && <span className="verified-badge">✓</span>}
                        <span className="user-handle">@{post.user.username}</span>
                        <span className="post-time">· {formatTime(post.timestamp)}</span>
                      </div>
                      <button className="more-options-btn">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    <div className="post-text">
                      {post.content}
                    </div>

                    {post.image && (
                      <div className="post-image">
                        <img src={post.image} alt="Post content" />
                      </div>
                    )}

                    {post.product && (
                      <div className="product-card">
                        <img src={post.product.image} alt={post.product.name} />
                        <div className="product-info">
                          <h4>{post.product.name}</h4>
                          <p className="product-price">${post.product.price}</p>
                          <button 
                            onClick={() => handleAddToCart(post.product)}
                            className="add-to-cart-btn"
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="post-stats">
                      <div className="stat">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`like-btn ${post.isLiked ? 'liked' : ''}`}
                        >
                          <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
                          <span>{post.likes}</span>
                        </button>
                      </div>
                      
                      <div className="stat">
                        <button className="comment-btn">
                          <MessageCircle size={18} />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                      
                      <div className="stat">
                        <button 
                          onClick={() => handleRetweet(post.id)}
                          className={`retweet-btn ${post.isRetweeted ? 'retweeted' : ''}`}
                        >
                          <Share size={18} />
                          <span>{post.retweets}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="home-sidebar">
          {/* Search */}
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search CommerceTweet" 
              className="search-input"
            />
          </div>

          {/* Trending Products */}
          <div className="sidebar-section">
            <h3>Trending Products</h3>
            <div className="trending-products">
              {trendingProducts.map(product => (
                <div key={product.id} className="trending-product">
                  <img src={product.image} alt={product.name} />
                  <div className="product-details">
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">${product.price}</span>
                    <div className="product-rating">
                      ⭐ {product.rating} ({product.sales} sold)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Who to Follow */}
          <div className="sidebar-section">
            <h3>Who to Follow</h3>
            <div className="suggested-users">
              {suggestedUsers.map(user => (
                <div key={user.id} className="suggested-user">
                  <img src={user.avatar} alt={user.name} />
                  <div className="user-info">
                    <div className="user-name">
                      {user.name}
                      {user.verified && <span className="verified-badge">✓</span>}
                    </div>
                    <div className="user-handle">{user.username}</div>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>
              ))}
            </div>
          </div>

          {/* Promoted Ad */}
          <div className="promoted-ad">
            <div className="ad-content">
              <h4>Start Selling Today!</h4>
              <p>Reach millions of customers on CommerceTweet</p>
              <button 
                className="ad-cta-btn"
                onClick={() => setShowProductModal(true)}
              >
                Create Your Store
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="sidebar-footer">
            <div className="footer-links">
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Accessibility</a>
              <a href="#">Ads Info</a>
              <a href="#">More</a>
            </div>
            <div className="copyright">
              © 2024 CommerceTweet, Inc.
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="product-modal">
            <div className="modal-header">
              <h3>Create Your Store</h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="close-modal-btn"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <p>Start selling your products to millions of users on CommerceTweet!</p>
              <div className="modal-features">
                <div className="feature">
                  <TrendingUp size={20} />
                  <span>Reach a large audience</span>
                </div>
                <div className="feature">
                  <ShoppingCart size={20} />
                  <span>Secure payment processing</span>
                </div>
                <div className="feature">
                  <Filter size={20} />
                  <span>Advanced analytics</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowProductModal(false);
                  window.location.href = '/store';
                }}
                className="create-store-btn"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format time
const formatTime = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInHours = (now - postTime) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return `${Math.floor(diffInHours * 60)}m`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else {
    return `${Math.floor(diffInHours / 24)}d`;
  }
};

// Mock posts data
const mockPosts = [
  {
    id: '1',
    user: {
      name: 'Tech Innovations',
      username: 'techinnovations',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100',
      verified: true
    },
    content: 'Check out our new wireless earbuds! Perfect sound quality with 30-hour battery life. #Tech #Audio',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    likes: 124,
    retweets: 45,
    comments: 12,
    isLiked: false,
    isRetweeted: false,
    type: 'post',
    product: {
      id: 'p1',
      name: 'Wireless Earbuds Pro',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=300'
    }
  },
  {
    id: '2',
    user: {
      name: 'Fashion Hub',
      username: 'fashionhub',
      avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100',
      verified: true
    },
    content: 'Summer collection is here! Get 20% off on all items this weekend. 🛍️',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    likes: 89,
    retweets: 23,
    comments: 7,
    isLiked: true,
    isRetweeted: false,
    type: 'post'
  },
  {
    id: '3',
    user: {
      name: 'Coffee Lovers',
      username: 'coffeelovers',
      avatar: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=100',
      verified: false
    },
    content: 'Just launched our new organic coffee blend! Perfect for your morning routine. ☕',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    likes: 67,
    retweets: 15,
    comments: 8,
    isLiked: false,
    isRetweeted: true,
    type: 'post',
    product: {
      id: 'p2',
      name: 'Organic Coffee Beans',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=300'
    }
  },
  {
    id: '4',
    user: {
      name: 'Gadget World',
      username: 'gadgetworld',
      avatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      verified: true
    },
    content: 'Limited time offer! Smart home devices at discounted prices. #SmartHome #TechDeals',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    likes: 234,
    retweets: 89,
    comments: 34,
    isLiked: false,
    isRetweeted: false,
    type: 'ad'
  }
];

export default Home;