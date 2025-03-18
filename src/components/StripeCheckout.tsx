
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Hike } from '@/lib/types';

interface StripeCheckoutProps {
  hike: Hike;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripeCheckout = ({ hike, onSuccess, onCancel }: StripeCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  
  // Calculate total price
  const totalPrice = hike.price ? hike.price * quantity : 0;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate payment processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Payment successful! Your booking is confirmed.');
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto w-full p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Booking Summary</h3>
          
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Hike:</span>
            <span className="text-gray-900 dark:text-white font-medium">{hike.name}</span>
          </div>
          
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Date:</span>
            <span className="text-gray-900 dark:text-white font-medium">{hike.date}</span>
          </div>
          
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Time:</span>
            <span className="text-gray-900 dark:text-white font-medium">{hike.time}</span>
          </div>
          
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Price per person:</span>
            <span className="text-gray-900 dark:text-white font-medium">${hike.price ? hike.price.toFixed(2) : '0.00'}</span>
          </div>
          
          {/* Quantity selector */}
          <div className="flex justify-between items-center mb-4">
            <label htmlFor="quantity" className="text-sm text-gray-600 dark:text-gray-400">
              Participants:
            </label>
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >-</button>
              <span className="w-8 text-center">{quantity}</span>
              <button 
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
              >+</button>
            </div>
          </div>
          
          {/* Total price */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="flex justify-between font-medium">
              <span className="text-gray-900 dark:text-white">Total:</span>
              <span className="text-primary">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Billing Details */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Billing Details</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input 
                type="text" 
                id="name" 
                defaultValue={user ? `${user.firstName} ${user.lastName}` : ''}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                disabled={loading}
                readOnly
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                defaultValue={user?.email || ''}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                disabled={loading}
                readOnly
              />
            </div>
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Information</h3>
          
          <div className="p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 text-sm">
            <p>Demo payment form - no real payments processed.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
              <input 
                type="text" 
                id="card-number" 
                placeholder="4242 4242 4242 4242" 
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  id="expiry" 
                  placeholder="MM / YY" 
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC</label>
                <input 
                  type="text" 
                  id="cvc" 
                  placeholder="123" 
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="w-1/2 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Pay $${totalPrice.toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripeCheckout;
