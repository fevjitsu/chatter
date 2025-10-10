// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  Download,
  Eye,
  MessageCircle,
  Star,
  MapPin,
  Calendar,
  CreditCard,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock orders data - replace with actual API calls
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error loading orders:', error);
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  // Get order status details
  const getStatusDetails = (status) => {
    const statusMap = {
      'pending': { 
        icon: Clock, 
        color: 'var(--sunshine-yellow)', 
        bgColor: 'rgba(255, 209, 0, 0.1)',
        label: 'Pending Payment'
      },
      'confirmed': { 
        icon: CheckCircle, 
        color: 'var(--caribbean-blue)', 
        bgColor: 'rgba(0, 161, 222, 0.1)',
        label: 'Order Confirmed'
      },
      'processing': { 
        icon: RefreshCw, 
        color: 'var(--sunset-orange)', 
        bgColor: 'rgba(255, 140, 0, 0.1)',
        label: 'Processing'
      },
      'shipped': { 
        icon: Truck, 
        color: 'var(--lime-green)', 
        bgColor: 'rgba(140, 198, 63, 0.1)',
        label: 'Shipped'
      },
      'delivered': { 
        icon: CheckCircle, 
        color: 'var(--evergreen)', 
        bgColor: 'rgba(34, 139, 34, 0.1)',
        label: 'Delivered'
      },
      'cancelled': { 
        icon: XCircle, 
        color: 'var(--tnt-red)', 
        bgColor: 'rgba(206, 17, 38, 0.1)',
        label: 'Cancelled'
      }
    };
    
    return statusMap[status] || statusMap.pending;
  };

  // Calculate order total
  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Handle order actions
  const handleReorder = (order) => {
    // Add all items from order to cart
    order.items.forEach(item => {
      // This would call your cart context addToCart function
      console.log('Adding to cart:', item);
    });
    navigate('/cart');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleTrackOrder = (order) => {
    // Navigate to tracking page or show tracking modal
    console.log('Track order:', order.id);
  };

  const handleLeaveReview = (order) => {
    // Navigate to review page
    console.log('Leave review for order:', order.id);
  };

  const handleDownloadInvoice = (order) => {
    // Generate and download invoice
    console.log('Download invoice for order:', order.id);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="loading-steelpan"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <div className="header-left">
            <button 
              onClick={() => navigate('/')}
              className="back-button caribbean-button-secondary"
            >
              <ArrowLeft size={18} />
              Back to Shopping
            </button>
            <h1>Your Orders</h1>
          </div>
          <div className="header-right">
            <span className="orders-count">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Orders
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'processing' ? 'active' : ''}`}
            onClick={() => setActiveFilter('processing')}
          >
            Processing
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'shipped' ? 'active' : ''}`}
            onClick={() => setActiveFilter('shipped')}
          >
            Shipped
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveFilter('delivered')}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders caribbean-card">
              <div className="no-orders-icon">📦</div>
              <h3>No orders found</h3>
              <p>
                {activeFilter === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `No ${activeFilter} orders found.`
                }
              </p>
              <button 
                onClick={() => navigate('/')}
                className="caribbean-button"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map(order => {
              const statusDetails = getStatusDetails(order.status);
              const StatusIcon = statusDetails.icon;
              const orderTotal = calculateOrderTotal(order);
              
              return (
                <div key={order.id} className="order-card caribbean-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-id">Order #{order.id}</div>
                      <div className="order-date">
                        <Calendar size={14} />
                        {new Date(order.orderDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div 
                      className="order-status"
                      style={{ 
                        color: statusDetails.color,
                        background: statusDetails.bgColor
                      }}
                    >
                      <StatusIcon size={16} />
                      {statusDetails.label}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-item-preview">
                        <img src={item.image} alt={item.name} />
                        {index === 2 && order.items.length > 3 && (
                          <div className="more-items">+{order.items.length - 3} more</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="order-details">
                    <div className="order-meta">
                      <div className="meta-item">
                        <ShoppingBag size={14} />
                        <span>{order.items.length} items</span>
                      </div>
                      <div className="meta-item">
                        <CreditCard size={14} />
                        <span>${orderTotal.toFixed(2)}</span>
                      </div>
                      {order.trackingNumber && (
                        <div className="meta-item">
                          <Truck size={14} />
                          <span>Track: {order.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Order Actions */}
                    <div className="order-actions">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="action-btn view-btn"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      
                      {order.status === 'shipped' && (
                        <button 
                          onClick={() => handleTrackOrder(order)}
                          className="action-btn track-btn"
                        >
                          <Truck size={16} />
                          Track Order
                        </button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <button 
                          onClick={() => handleLeaveReview(order)}
                          className="action-btn review-btn"
                        >
                          <Star size={16} />
                          Leave Review
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleReorder(order)}
                        className="action-btn reorder-btn"
                      >
                        <RefreshCw size={16} />
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={handleCloseOrderDetails}
          onDownloadInvoice={handleDownloadInvoice}
          onReorder={handleReorder}
          onTrackOrder={handleTrackOrder}
          onLeaveReview={handleLeaveReview}
        />
      )}
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, onDownloadInvoice, onReorder, onTrackOrder, onLeaveReview }) => {
  const statusDetails = getStatusDetails(order.status);
  const StatusIcon = statusDetails.icon;
  const orderTotal = calculateOrderTotal(order);
  const shipping = order.shippingCost || 4.99;
  const tax = orderTotal * 0.08;
  const discount = order.discountAmount || 0;
  const finalTotal = orderTotal + shipping + tax - discount;

  const getStatusDescription = (status) => {
    const descriptions = {
      'pending': 'Your order is awaiting payment confirmation.',
      'confirmed': 'Your order has been confirmed and is being prepared.',
      'processing': 'Your order is being processed and will ship soon.',
      'shipped': 'Your order has been shipped and is on its way.',
      'delivered': 'Your order has been delivered successfully.',
      'cancelled': 'This order has been cancelled.'
    };
    return descriptions[status];
  };

  return (
    <div className="modal-overlay">
      <div className="order-details-modal caribbean-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>Order Details</h2>
            <div className="order-id">#{order.id}</div>
          </div>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Order Status */}
          <div className="order-status-section">
            <div 
              className="status-badge-large"
              style={{ 
                color: statusDetails.color,
                background: statusDetails.bgColor
              }}
            >
              <StatusIcon size={20} />
              {statusDetails.label}
            </div>
            <p className="status-description">
              {getStatusDescription(order.status)}
            </p>
          </div>

          {/* Shipping Information */}
          <div className="info-section">
            <h3>Shipping Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Shipping Address:</strong>
                <p>{order.shippingAddress.fullName}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              </div>
              <div className="info-item">
                <strong>Contact:</strong>
                <p>{order.contactEmail}<br />
                {order.contactPhone}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="info-section">
            <h3>Order Items</h3>
            <div className="order-items-detailed">
              {order.items.map((item, index) => (
                <div key={index} className="order-item-detailed">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="item-seller">Sold by: {item.seller?.name || 'Local Merchant'}</p>
                    <p className="item-price">${item.price} x {item.quantity}</p>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="info-section">
            <h3>Order Summary</h3>
            <div className="order-summary-detailed">
              <div className="summary-line">
                <span>Subtotal ({order.items.length} items):</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-line discount">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-line">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-line">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-line grand-total">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="modal-actions">
            <button 
              onClick={() => onDownloadInvoice(order)}
              className="action-btn caribbean-button-secondary"
            >
              <Download size={16} />
              Download Invoice
            </button>
            <button 
              onClick={() => onReorder(order)}
              className="action-btn caribbean-button"
            >
              <RefreshCw size={16} />
              Reorder All Items
            </button>
            {order.status === 'shipped' && (
              <button 
                onClick={() => onTrackOrder(order)}
                className="action-btn caribbean-button"
              >
                <Truck size={16} />
                Track Package
              </button>
            )}
            {order.status === 'delivered' && (
              <button 
                onClick={() => onLeaveReview(order)}
                className="action-btn caribbean-button"
              >
                <Star size={16} />
                Leave Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions (defined outside component)
const getStatusDetails = (status) => {
  const statusMap = {
    'pending': { 
      icon: Clock, 
      color: 'var(--sunshine-yellow)', 
      bgColor: 'rgba(255, 209, 0, 0.1)',
      label: 'Pending Payment'
    },
    'confirmed': { 
      icon: CheckCircle, 
      color: 'var(--caribbean-blue)', 
      bgColor: 'rgba(0, 161, 222, 0.1)',
      label: 'Order Confirmed'
    },
    'processing': { 
      icon: RefreshCw, 
      color: 'var(--sunset-orange)', 
      bgColor: 'rgba(255, 140, 0, 0.1)',
      label: 'Processing'
    },
    'shipped': { 
      icon: Truck, 
      color: 'var(--lime-green)', 
      bgColor: 'rgba(140, 198, 63, 0.1)',
      label: 'Shipped'
    },
    'delivered': { 
      icon: CheckCircle, 
      color: 'var(--evergreen)', 
      bgColor: 'rgba(34, 139, 34, 0.1)',
      label: 'Delivered'
    },
    'cancelled': { 
      icon: XCircle, 
      color: 'var(--tnt-red)', 
      bgColor: 'rgba(206, 17, 38, 0.1)',
      label: 'Cancelled'
    }
  };
  
  return statusMap[status] || statusMap.pending;
};

const calculateOrderTotal = (order) => {
  return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Mock orders data
const mockOrders = [
  {
    id: 'TRINI-2024-001',
    orderDate: '2024-03-15T10:30:00Z',
    status: 'delivered',
    items: [
      {
        id: '1',
        name: 'Handcrafted Steelpan Art',
        price: 89.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=150',
        seller: { name: 'Caribbean Crafts' }
      },
      {
        id: '2',
        name: 'Trinidad Hot Sauce Pack',
        price: 24.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150',
        seller: { name: 'Island Flavors' }
      }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: '123 Main Street',
      city: 'Port of Spain',
      state: 'Trinidad',
      zipCode: '00000'
    },
    contactEmail: 'john@example.com',
    contactPhone: '+1-868-123-4567',
    trackingNumber: 'TRK123456789',
    shippingCost: 0,
    discountAmount: 10.00
  },
  {
    id: 'TRINI-2024-002',
    orderDate: '2024-03-18T14:20:00Z',
    status: 'shipped',
    items: [
      {
        id: '3',
        name: 'Caribbean Coffee Beans',
        price: 19.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=150',
        seller: { name: 'Tropical Brews' }
      }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: '123 Main Street',
      city: 'Port of Spain',
      state: 'Trinidad',
      zipCode: '00000'
    },
    contactEmail: 'john@example.com',
    contactPhone: '+1-868-123-4567',
    trackingNumber: 'TRK987654321',
    shippingCost: 4.99,
    discountAmount: 0
  },
  {
    id: 'TRINI-2024-003',
    orderDate: '2024-03-20T09:15:00Z',
    status: 'processing',
    items: [
      {
        id: '4',
        name: 'Handwoven Basket',
        price: 34.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150',
        seller: { name: 'Artisan Creations' }
      },
      {
        id: '5',
        name: 'Coconut Shell Jewelry',
        price: 45.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150',
        seller: { name: 'Island Treasures' }
      }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: '123 Main Street',
      city: 'Port of Spain',
      state: 'Trinidad',
      zipCode: '00000'
    },
    contactEmail: 'john@example.com',
    contactPhone: '+1-868-123-4567',
    shippingCost: 4.99,
    discountAmount: 5.00
  }
];

export default Orders;