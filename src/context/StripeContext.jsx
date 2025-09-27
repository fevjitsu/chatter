// src/context/StripeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { useAuth } from './AuthContext';

// Create Stripe context
const StripeContext = createContext();

// Custom hook to use Stripe context
export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within StripeProvider');
  }
  return context;
};

// Stripe provider component
export const StripeProvider = ({ children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        setStripePromise(stripe);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  /**
   * Create a payment intent for processing payments
   * @param {number} amount - The amount to charge (in dollars)
   * @param {Object} metadata - Additional metadata for the payment
   * @returns {Promise} Payment intent data including client secret
   */
  const createPaymentIntent = async (amount, metadata = {}) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to make payments');
      }

      if (!amount || amount < 0.5) {
        throw new Error('Amount must be at least $0.50');
      }

      // Call the Cloud Function to create payment intent
      const createPaymentIntentFunction = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntentFunction({
        amount: amount,
        currency: 'usd',
        metadata: {
          ...metadata,
          userEmail: user.email,
          userName: user.displayName || 'Customer'
        }
      });

      return result.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      
      // Handle specific error cases
      if (error.message.includes('unauthenticated')) {
        throw new Error('Please log in to complete your purchase');
      } else if (error.message.includes('invalid-argument')) {
        throw new Error('Invalid payment amount');
      } else {
        throw new Error('Failed to initialize payment. Please try again.');
      }
    }
  };

  /**
   * Process payment with Stripe Elements
   * @param {Object} paymentData - Payment data including card element and client secret
   * @returns {Promise} Payment result from Stripe
   */
  const processPayment = async (paymentData) => {
    if (!stripePromise) {
      throw new Error('Stripe has not been properly initialized');
    }

    if (!paymentData.clientSecret) {
      throw new Error('Payment intent is missing client secret');
    }

    const stripe = await stripePromise;

    try {
      const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card: paymentData.cardElement,
          billing_details: {
            name: paymentData.name || user.displayName || 'Customer',
            email: paymentData.email || user.email,
            address: paymentData.address || {}
          },
        },
        return_url: `${window.location.origin}/payment-success`,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  /**
   * Create a customer portal session for managing billing
   * @param {string} returnUrl - URL to redirect after portal session
   * @returns {Promise} Portal session data including URL
   */
  const createPortalSession = async (returnUrl) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const createPortalSessionFunction = httpsCallable(functions, 'createCustomerPortalSession');
      const result = await createPortalSessionFunction({
        returnUrl: returnUrl || `${window.location.origin}/profile`
      });

      return result.data;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  };

  /**
   * Get user's payment history
   * @param {number} limit - Number of payments to retrieve
   * @returns {Promise} User's payment history
   */
  const getPaymentHistory = async (limit = 10) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const getPaymentHistoryFunction = httpsCallable(functions, 'getPaymentHistory');
      const result = await getPaymentHistoryFunction({ limit });

      return result.data;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  };

  const value = {
    stripePromise,
    createPaymentIntent,
    processPayment,
    createPortalSession,
    getPaymentHistory,
    loading
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};