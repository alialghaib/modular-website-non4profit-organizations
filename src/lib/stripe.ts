
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with test key (safe to expose in client code)
export const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

// Function to handle checkout session creation
export const createCheckoutSession = async (hikeId: string, price: number, quantity: number = 1) => {
  try {
    // Simulate successful response
    // In production, this would call a serverless function to create a real Stripe session
    return { 
      success: true, 
      sessionId: `cs_test_${Math.random().toString(36).substring(2, 10)}`,
      url: '#/demo-checkout'
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return { success: false, error: 'Failed to create checkout session' };
  }
};

// Handle existing payment retrieval
export const handleExistingPayment = (paymentId: string) => {
  // Simulate successful payment retrieval
  return {
    status: 'succeeded',
    amount: 5000, // $50.00
    created: new Date().toISOString(),
    receiptUrl: '#/demo-receipt'
  };
};
