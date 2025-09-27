// src/components/SimpleCheckout.jsx
import React, { useState } from 'react';
import { useStripeContext } from '../context/StripeContext';
import { useAuth } from '../context/AuthContext';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const SimpleCheckout = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { createPaymentIntent, processPayment } = useStripeContext();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!stripe || !elements) {
      setError('Stripe has not loaded properly. Please refresh the page.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create payment intent
      const paymentIntent = await createPaymentIntent(amount, {
        description: 'Product purchase',
        type: 'one-time'
      });

      // Step 2: Process payment
      const cardElement = elements.getElement(CardElement);
      const result = await processPayment({
        clientSecret: paymentIntent.clientSecret,
        cardElement: cardElement,
        name: user.displayName,
        email: user.email
      });

      // Step 3: Handle success
      if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        backgroundColor: '#fff',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="checkout-container">
      <h3>Complete Your Purchase</h3>
      <p>Amount: ${amount}</p>
      
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="card-element-wrapper">
          <CardElement options={cardElementOptions} />
        </div>
        
        {error && (
          <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
            {error}
          </div>
        )}
        
        <div className="checkout-actions">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={!stripe || loading}
            className="pay-btn"
          >
            {loading ? 'Processing...' : `Pay $${amount}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleCheckout;