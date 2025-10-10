// src/context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  APPLY_DISCOUNT: 'APPLY_DISCOUNT',
  REMOVE_DISCOUNT: 'REMOVE_DISCOUNT'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload || []
      };

    case CART_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
          lastAction: 'added'
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
        lastAction: 'added'
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        lastAction: 'removed'
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      if (action.payload.quantity < 1) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
          lastAction: 'removed'
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        lastAction: 'updated'
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        discount: null,
        lastAction: 'cleared'
      };

    case CART_ACTIONS.APPLY_DISCOUNT:
      return {
        ...state,
        discount: action.payload
      };

    case CART_ACTIONS.REMOVE_DISCOUNT:
      return {
        ...state,
        discount: null
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  discount: null,
  lastAction: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('triniconnect_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData.items });
        if (cartData.discount) {
          dispatch({ type: CART_ACTIONS.APPLY_DISCOUNT, payload: cartData.discount });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('triniconnect_cart', JSON.stringify({
      items: state.items,
      discount: state.discount,
      timestamp: new Date().toISOString()
    }));
  }, [state.items, state.discount]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { ...product, quantity }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: productId
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity }
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Apply discount code
  const applyDiscount = (discountCode) => {
    // Mock discount codes - in real app, validate against backend
    const discounts = {
      'TRINI10': { type: 'percentage', value: 10, code: 'TRINI10', message: '10% off your order!' },
      'CARIBBEAN15': { type: 'percentage', value: 15, code: 'CARIBBEAN15', message: '15% Caribbean discount!' },
      'FREESHIP': { type: 'shipping', value: 0, code: 'FREESHIP', message: 'Free shipping applied!' },
      'WELCOME5': { type: 'fixed', value: 5, code: 'WELCOME5', message: '$5 off your order!' }
    };

    const discount = discounts[discountCode.toUpperCase()];
    if (discount) {
      dispatch({ type: CART_ACTIONS.APPLY_DISCOUNT, payload: discount });
      return { success: true, message: discount.message };
    } else {
      return { success: false, message: 'Invalid discount code' };
    }
  };

  // Remove discount
  const removeDiscount = () => {
    dispatch({ type: CART_ACTIONS.REMOVE_DISCOUNT });
  };

  // Calculate cart totals
  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    if (!state.discount) return 0;

    const subtotal = getCartTotal();
    
    switch (state.discount.type) {
      case 'percentage':
        return (subtotal * state.discount.value) / 100;
      case 'fixed':
        return Math.min(state.discount.value, subtotal);
      case 'shipping':
        return 0; // Shipping handled separately
      default:
        return 0;
    }
  };

  const getShippingCost = () => {
    const subtotal = getCartTotal();
    // Free shipping over $50 or if FREESHIP code applied
    if (subtotal >= 50 || (state.discount && state.discount.type === 'shipping')) {
      return 0;
    }
    return 4.99; // Standard shipping
  };

  const getTaxAmount = () => {
    const subtotal = getCartTotal();
    return subtotal * 0.08; // 8% tax
  };

  const getFinalTotal = () => {
    const subtotal = getCartTotal();
    const discount = getDiscountAmount();
    const shipping = getShippingCost();
    const tax = getTaxAmount();
    
    return Math.max(0, subtotal - discount + shipping + tax);
  };

  // Get cart items count
  const getCartItemsCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Calculate savings
  const getSavings = () => {
    return getDiscountAmount();
  };

  const value = {
    // State
    items: state.items,
    discount: state.discount,
    lastAction: state.lastAction,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyDiscount,
    removeDiscount,
    
    // Getters
    getCartTotal,
    getDiscountAmount,
    getShippingCost,
    getTaxAmount,
    getFinalTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity,
    getSavings
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};