// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with your secret key
const stripe = new Stripe(functions.config().stripe.secret_key, {
    apiVersion: '2023-10-16',
});

/**
 * Create a Payment Intent for processing payments
 * This is a callable function that can be invoked from the frontend
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    // Validate that the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated', 
            'User must be authenticated to make payments'
        );
    }

    const { amount, currency = 'usd', metadata = {} } = data;

    // Validate input parameters
    if (!amount || typeof amount !== 'number') {
        throw new functions.https.HttpsError(
            'invalid-argument', 
            'Amount is required and must be a number'
        );
    }

    if (amount < 0.5) { // Minimum $0.50
        throw new functions.https.HttpsError(
            'invalid-argument', 
            'Amount must be at least $0.50'
        );
    }

    try {
        // Create Payment Intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert dollars to cents
            currency: currency,
            metadata: {
                ...metadata,
                userId: context.auth.uid,
                userEmail: context.auth.token.email || '',
                timestamp: Date.now().toString()
            },
            // Specify allowed payment methods for security
            payment_method_types: ['card'],
            // Optional: setup_future_usage if you want to save cards
            // setup_future_usage: 'on_session',
        });

        // Log the payment attempt for security and analytics
        await admin.firestore().collection('paymentLogs').add({
            userId: context.auth.uid,
            amount: amount,
            currency: currency,
            paymentIntentId: paymentIntent.id,
            status: 'created',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            metadata: metadata
        });

        // Return client secret to the frontend
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: amount,
            currency: currency
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        
        // Log the error
        await admin.firestore().collection('paymentErrors').add({
            userId: context.auth.uid,
            error: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            amount: amount
        });

        throw new functions.https.HttpsError(
            'internal', 
            'Unable to create payment intent. Please try again.'
        );
    }
});

/**
 * Webhook handler for Stripe events
 * This handles successful payments and other Stripe events
 */
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify that the webhook request came from Stripe
        event = stripe.webhooks.constructEvent(
            req.rawBody, 
            sig, 
            functions.config().stripe.webhook_secret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Handle different types of Stripe events
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object);
            break;
            
        case 'payment_intent.payment_failed':
            await handlePaymentIntentFailed(event.data.object);
            break;
            
        case 'charge.succeeded':
            await handleChargeSucceeded(event.data.object);
            break;
            
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
});

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
    try {
        const userId = paymentIntent.metadata.userId;
        const amount = paymentIntent.amount / 100; // Convert cents back to dollars
        
        console.log(`Payment successful for user ${userId}: $${amount}`);

        // Update the payment log
        const paymentLogsQuery = await admin.firestore().collection('paymentLogs')
            .where('paymentIntentId', '==', paymentIntent.id)
            .get();
            
        if (!paymentLogsQuery.empty) {
            const logDoc = paymentLogsQuery.docs[0];
            await logDoc.ref.update({
                status: 'succeeded',
                succeededAt: admin.firestore.FieldValue.serverTimestamp(),
                stripeChargeId: paymentIntent.charges.data[0]?.id
            });
        }

        // Create or update order in Firestore
        await admin.firestore().collection('orders').doc(paymentIntent.id).set({
            paymentIntentId: paymentIntent.id,
            userId: userId,
            amount: amount,
            currency: paymentIntent.currency,
            status: 'completed',
            customerEmail: paymentIntent.metadata.userEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: paymentIntent.metadata,
            stripeData: {
                chargeId: paymentIntent.charges.data[0]?.id,
                paymentMethod: paymentIntent.payment_method_types[0]
            }
        }, { merge: true });

        // Update product inventory if product information is in metadata
        if (paymentIntent.metadata.productId && paymentIntent.metadata.quantity) {
            await updateProductInventory(
                paymentIntent.metadata.productId, 
                parseInt(paymentIntent.metadata.quantity)
            );
        }

        // Send confirmation email or notification here if needed
        console.log(`Order created successfully for payment intent: ${paymentIntent.id}`);
        
    } catch (error) {
        console.error('Error handling successful payment:', error);
        
        // Log the error for debugging
        await admin.firestore().collection('webhookErrors').add({
            eventType: 'payment_intent.succeeded',
            paymentIntentId: paymentIntent.id,
            error: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent) {
    try {
        console.log(`Payment failed for intent: ${paymentIntent.id}`);
        
        // Update payment log
        const paymentLogsQuery = await admin.firestore().collection('paymentLogs')
            .where('paymentIntentId', '==', paymentIntent.id)
            .get();
            
        if (!paymentLogsQuery.empty) {
            const logDoc = paymentLogsQuery.docs[0];
            await logDoc.ref.update({
                status: 'failed',
                failedAt: admin.firestore.FieldValue.serverTimestamp(),
                error: paymentIntent.last_payment_error?.message || 'Payment failed'
            });
        }

        // Create failed order record
        await admin.firestore().collection('orders').doc(paymentIntent.id).set({
            paymentIntentId: paymentIntent.id,
            userId: paymentIntent.metadata.userId,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'failed',
            failedAt: admin.firestore.FieldValue.serverTimestamp(),
            error: paymentIntent.last_payment_error?.message
        }, { merge: true });
        
    } catch (error) {
        console.error('Error handling failed payment:', error);
    }
}

/**
 * Handle successful charge
 */
async function handleChargeSucceeded(charge) {
    try {
        console.log(`Charge succeeded: ${charge.id}`);
        
        // You can add additional charge handling logic here
        // For example, send email receipts, update analytics, etc.
        
    } catch (error) {
        console.error('Error handling charge succeeded:', error);
    }
}

/**
 * Create a customer portal session for managing subscriptions and billing
 */
exports.createCustomerPortalSession = functions.https.onCall(async (data, context) => {
    // Validate authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated', 
            'User must be authenticated'
        );
    }

    const { returnUrl } = data;

    try {
        const userId = context.auth.uid;
        const userEmail = context.auth.token.email;

        // Get user document from Firestore
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();

        let customerId = userData?.stripeCustomerId;

        // Create a new Stripe customer if one doesn't exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    firebaseUID: userId
                },
                name: userData?.displayName || ''
            });

            customerId = customer.id;

            // Save Stripe customer ID to user document
            await admin.firestore().collection('users').doc(userId).set({
                stripeCustomerId: customerId,
                stripeCustomerEmail: userEmail
            }, { merge: true });
        }

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || 'https://yourapp.com/profile',
        });

        return { 
            url: portalSession.url,
            customerId: customerId
        };

    } catch (error) {
        console.error('Error creating customer portal session:', error);
        
        await admin.firestore().collection('functionErrors').add({
            functionName: 'createCustomerPortalSession',
            userId: context.auth.uid,
            error: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        throw new functions.https.HttpsError(
            'internal', 
            'Unable to create customer portal session'
        );
    }
});

/**
 * Helper function to update product inventory after a successful purchase
 */
async function updateProductInventory(productId, quantity) {
    try {
        const productRef = admin.firestore().collection('products').doc(productId);
        const productDoc = await productRef.get();

        if (productDoc.exists) {
            const currentStock = productDoc.data().stock || 0;
            const newStock = Math.max(0, currentStock - quantity);

            await productRef.update({
                stock: newStock,
                lastSold: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`Updated inventory for product ${productId}: ${currentStock} -> ${newStock}`);
        }
    } catch (error) {
        console.error('Error updating product inventory:', error);
        throw error;
    }
}

/**
 * Get user's payment history
 */
exports.getPaymentHistory = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const userId = context.auth.uid;
        const { limit = 10 } = data;

        // Get user's orders from Firestore
        const ordersQuery = await admin.firestore().collection('orders')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        const paymentHistory = ordersQuery.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { payments: paymentHistory };

    } catch (error) {
        console.error('Error getting payment history:', error);
        throw new functions.https.HttpsError('internal', 'Unable to retrieve payment history');
    }
});