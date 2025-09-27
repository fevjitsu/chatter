// src/context/StripeContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripeContext = createContext();

export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const [stripePromise] = useState(() => 
    loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  );

  // Create payment intent
  const createPaymentIntent = async (amount, currency = 'usd') => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
        }),
      });

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  // Process payment
  const processPayment = async (paymentData) => {
    // Implement payment processing logic
    // This would interact with your backend
  };

  const value = {
    stripePromise,
    createPaymentIntent,
    processPayment
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};