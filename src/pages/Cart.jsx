// src/pages/Cart.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Tag,
  Truck,
  Shield,
  CreditCard
} from 'lucide-react';

const Cart = () => {
  const { 
    items, 
    discount,
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    applyDiscount,
    removeDiscount,
    getCartTotal,
    getDiscountAmount,
    getShippingCost,
    getTaxAmount,
    getFinalTotal,
    getCartItemsCount,
    getSavings
  } = useCart();
  
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;
    
    const result = applyDiscount(discountCode);
    setDiscountMessage(result.message);
    setDiscountCode('');
    
    // Clear message after 3 seconds
    setTimeout(() => setDiscountMessage(''), 3000);
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    setDiscountMessage('Discount removed');
    setTimeout(() => setDiscountMessage(''), 3000);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty caribbean-card">
            <div className="empty-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Add some Caribbean treasures to your cart!</p>
            <button 
              onClick={handleContinueShopping}
              className="caribbean-button"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <button 
            onClick={handleContinueShopping}
            className="back-button caribbean-button-secondary"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </button>
          <h1>Your Shopping Cart</h1>
          <span className="cart-count">
            {getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="section-header">
              <ShoppingBag size={20} />
              <h3>Cart Items</h3>
              <button 
                onClick={clearCart}
                className="clear-cart-btn"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>
            </div>

            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item caribbean-card">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="item-image"
                  />
                  
                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-seller">Sold by: {item.seller?.name || 'Local Merchant'}</p>
                    <p className="item-price">${item.price}</p>
                  </div>

                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary caribbean-card">
              <h3>Order Summary</h3>

              {/* Discount Code */}
              <div className="discount-section">
                <div className="discount-input-group">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="caribbean-input discount-input"
                  />
                  <button 
                    onClick={handleApplyDiscount}
                    className="caribbean-button discount-btn"
                  >
                    <Tag size={16} />
                    Apply
                  </button>
                </div>
                
                {discountMessage && (
                  <div className={`discount-message ${discountMessage.includes('Invalid') ? 'error' : 'success'}`}>
                    {discountMessage}
                  </div>
                )}

                {discount && (
                  <div className="applied-discount">
                    <span>Applied: {discount.code}</span>
                    <button 
                      onClick={handleRemoveDiscount}
                      className="remove-discount-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Order Totals */}
              <div className="order-totals">
                <div className="total-line">
                  <span>Subtotal ({getCartItemsCount()} items)</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>

                {discount && getDiscountAmount() > 0 && (
                  <div className="total-line discount-line">
                    <span>Discount ({discount.code})</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}

                <div className="total-line">
                  <span>
                    <Truck size={14} />
                    Shipping
                    {getShippingCost() === 0 && <span className="free-shipping"> FREE</span>}
                  </span>
                  <span>
                    {getShippingCost() === 0 ? 'FREE' : `$${getShippingCost().toFixed(2)}`}
                  </span>
                </div>

                <div className="total-line">
                  <span>Tax</span>
                  <span>${getTaxAmount().toFixed(2)}</span>
                </div>

                <div className="total-line grand-total">
                  <span>Total</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>

                {getSavings() > 0 && (
                  <div className="savings-banner">
                    <span>You save ${getSavings().toFixed(2)}!</span>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                className="checkout-btn caribbean-button"
              >
                <CreditCard size={18} />
                Proceed to Checkout
              </button>

              {/* Security Badge */}
              <div className="security-badge">
                <Shield size={16} />
                <span>Secure checkout • Encrypted payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;