// src/components/CartIcon.jsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartIcon = () => {
  const { getCartItemsCount } = useCart();
  const itemCount = getCartItemsCount();

  return (
    <Link to="/cart" className="cart-icon-link">
      <div className="cart-icon-container">
        <ShoppingCart size={24} className="cart-icon" />
        {itemCount > 0 && (
          <span className="cart-badge caribbean-badge">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;