// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStripeContext } from '../context/StripeContext';
import {
  CreditCard,
  Truck,
  Shield,
  Lock,
  X,
  Plus,
  Minus,
  MapPin,
  Edit,
  Check
} from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { createPaymentIntent, processPayment } = useStripeContext();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Review, 2: Payment, 3: Confirmation
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({ ...shippingAddress });

  // Load cart data (mock data - replace with actual cart context)
  useEffect(() => {
    const loadCart = () => {
      // This would typically come from a CartContext
      const mockCart = [
        {
          id: '1',
          productId: 'p1',
          name: 'Wireless Earbuds Pro',
          price: 129.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=150',
          seller: {
            name: 'Tech Innovations',
            verified: true
          }
        },
        {
          id: '2',
          productId: 'p2',
          name: 'Organic Coffee Beans',
          price: 24.99,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=150',
          seller: {
            name: 'Coffee Lovers',
            verified: true
          }
        }
      ];
      setCart(mockCart);
    };

    loadCart();
  }, []);

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 4.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Handle shipping address change
  const handleShippingChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));

    if (billingSameAsShipping) {
      setBillingAddress(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle billing address change
  const handleBillingChange = (field, value) => {
    setBillingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = ['fullName', 'address', 'city', 'state', 'zipCode'];
    
    for (let field of requiredFields) {
      if (!shippingAddress[field].trim()) {
        setError(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!billingSameAsShipping) {
      for (let field of requiredFields) {
        if (!billingAddress[field].trim()) {
          setError(`Please fill in your billing ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }
    }

    return true;
  };

  // Process payment
  const handlePayment = async (paymentData) => {
    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntent(total, {
        cartItems: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
        userId: user.uid,
        userEmail: user.email
      });

      // Process payment with Stripe
      const result = await processPayment({
        clientSecret: paymentIntent.clientSecret,
        ...paymentData
      });

      if (result.paymentIntent.status === 'succeeded') {
        setSuccess('Payment successful!');
        setStep(3);
        
        // Clear cart (would typically update CartContext)
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      }

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Continue to payment step
  const continueToPayment = () => {
    if (validateForm()) {
      setStep(2);
      setError('');
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out</p>
          <button 
            onClick={() => navigate('/')}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Review</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Payment</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <Check size={20} />
            {success}
          </div>
        )}

        <div className="checkout-content">
          {/* Left Column - Forms */}
          <div className="checkout-left">
            {/* Step 1: Review Order & Shipping */}
            {step === 1 && (
              <div className="checkout-step">
                <div className="step-header">
                  <h2>Shipping Information</h2>
                </div>

                {/* Shipping Address */}
                <div className="form-section">
                  <div className="section-header">
                    <MapPin size={20} />
                    <h3>Shipping Address</h3>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleShippingChange('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Address *</label>
                      <input
                        type="text"
                        value={shippingAddress.address}
                        onChange={(e) => handleShippingChange('address', e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        placeholder="New York"
                      />
                    </div>

                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleShippingChange('state', e.target.value)}
                        placeholder="NY"
                      />
                    </div>

                    <div className="form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                        placeholder="10001"
                      />
                    </div>

                    <div className="form-group">
                      <label>Country</label>
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => handleShippingChange('country', e.target.value)}
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="form-section">
                  <div className="section-header">
                    <CreditCard size={20} />
                    <h3>Billing Address</h3>
                  </div>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => {
                        setBillingSameAsShipping(e.target.checked);
                        if (e.target.checked) {
                          setBillingAddress({ ...shippingAddress });
                        }
                      }}
                    />
                    <span>Same as shipping address</span>
                  </label>

                  {!billingSameAsShipping && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          value={billingAddress.fullName}
                          onChange={(e) => handleBillingChange('fullName', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Address *</label>
                        <input
                          type="text"
                          value={billingAddress.address}
                          onChange={(e) => handleBillingChange('address', e.target.value)}
                          placeholder="123 Main Street"
                        />
                      </div>

                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) => handleBillingChange('city', e.target.value)}
                          placeholder="New York"
                        />
                      </div>

                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          value={billingAddress.state}
                          onChange={(e) => handleBillingChange('state', e.target.value)}
                          placeholder="NY"
                        />
                      </div>

                      <div className="form-group">
                        <label>ZIP Code *</label>
                        <input
                          type="text"
                          value={billingAddress.zipCode}
                          onChange={(e) => handleBillingChange('zipCode', e.target.value)}
                          placeholder="10001"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={continueToPayment}
                  className="continue-btn"
                  disabled={loading}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <PaymentStep 
                onBack={() => setStep(1)}
                onPayment={handlePayment}
                loading={loading}
                user={user}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <ConfirmationStep 
                orderDetails={{
                  orderId: `ORD-${Date.now()}`,
                  total,
                  items: cart,
                  shippingAddress,
                  estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
                }}
              />
            )}
          </div>

          {/* Right Column - Order Summary */}
          {step !== 3 && (
            <div className="checkout-right">
              <div className="order-summary">
                <h3>Order Summary</h3>
                
                {/* Cart Items */}
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-seller">Sold by: {item.seller.name}</div>
                        <div className="item-price">${item.price}</div>
                      </div>
                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="remove-btn"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="order-totals">
                  <div className="total-line">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-line">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="total-line">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="total-line grand-total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="security-badges">
                  <div className="badge">
                    <Shield size={16} />
                    <span>Secure Payment</span>
                  </div>
                  <div className="badge">
                    <Lock size={16} />
                    <span>Encrypted</span>
                  </div>
                  <div className="badge">
                    <Truck size={16} />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Step Component
const PaymentStep = ({ onBack, onPayment, loading, user, paymentMethod, setPaymentMethod }) => {
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
      alert('Please fill in all card details');
      return;
    }

    onPayment({
      cardElement: { // This would be replaced with Stripe Elements in real implementation
        ...cardDetails
      },
      name: cardDetails.name,
      email: user.email
    });
  };

  return (
    <div className="checkout-step">
      <div className="step-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h2>Payment Method</h2>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        {/* Payment Method Selection */}
        <div className="payment-methods">
          <label className="payment-method">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <CreditCard size={20} />
            <span>Credit/Debit Card</span>
          </label>

          <label className="payment-method disabled">
            <input type="radio" name="paymentMethod" disabled />
            <span>PayPal (Coming Soon)</span>
          </label>

          <label className="payment-method disabled">
            <input type="radio" name="paymentMethod" disabled />
            <span>Cryptocurrency (Coming Soon)</span>
          </label>
        </div>

        {/* Card Details */}
        {paymentMethod === 'card' && (
          <div className="card-form">
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                  placeholder="123"
                  maxLength="3"
                />
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="pay-now-btn"
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay Now $${document.querySelector('.grand-total span:last-child')?.textContent?.replace('$', '') || '0.00'}`}
        </button>
      </form>
    </div>
  );
};

// Confirmation Step Component
const ConfirmationStep = ({ orderDetails }) => {
  const navigate = useNavigate();

  return (
    <div className="confirmation-step">
      <div className="confirmation-content">
        <div className="success-icon">🎉</div>
        <h2>Order Confirmed!</h2>
        <p className="confirmation-message">
          Thank you for your purchase. Your order has been successfully processed.
        </p>

        <div className="order-details">
          <div className="detail-item">
            <strong>Order ID:</strong>
            <span>{orderDetails.orderId}</span>
          </div>
          <div className="detail-item">
            <strong>Total Amount:</strong>
            <span>${orderDetails.total.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <strong>Estimated Delivery:</strong>
            <span>{orderDetails.estimatedDelivery.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <button 
            onClick={() => navigate('/orders')}
            className="view-orders-btn"
          >
            View My Orders
          </button>
          <button 
            onClick={() => navigate('/')}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;