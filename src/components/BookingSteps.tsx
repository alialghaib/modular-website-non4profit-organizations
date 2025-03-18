
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hike } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import CalBooking from './CalBooking';
import StripeCheckout from './StripeCheckout';
import { toast } from 'sonner';

interface BookingStepsProps {
  hike: Hike;
  hikeId?: string;
}

// Booking process steps
enum BookingStep {
  DETAILS,
  SCHEDULE,
  PAYMENT,
  CONFIRMATION
}

const BookingSteps = ({ hike, hikeId }: BookingStepsProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.DETAILS);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Start the booking process
  const handleStartBooking = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a hike");
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'hiker') {
      toast.error("Only hikers can book hikes");
      return;
    }
    
    setCurrentStep(BookingStep.SCHEDULE);
  };
  
  // Navigation between steps
  const goToSchedule = () => setCurrentStep(BookingStep.SCHEDULE);
  const goToPayment = () => setCurrentStep(BookingStep.PAYMENT);
  const goToConfirmation = () => setCurrentStep(BookingStep.CONFIRMATION);
  const goBack = () => setCurrentStep(BookingStep.DETAILS);
  
  // Render content based on current step
  switch (currentStep) {
    case BookingStep.DETAILS:
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Hike Image */}
          <div className="relative h-64 md:h-80">
            <img 
              src={hike?.image} 
              alt={hike?.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                  hike?.difficulty === 'easy' ? 'bg-green-500 text-white' :
                  hike?.difficulty === 'moderate' ? 'bg-yellow-500 text-gray-900' :
                  'bg-red-500 text-white'
                }`}>
                  {hike?.difficulty}
                </span>
                <span className="text-white text-sm">{hike?.duration}</span>
              </div>
            </div>
          </div>
          
          {/* Hike Details */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{hike?.name}</h1>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {hike?.location}
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {hike?.date}
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {hike?.time}
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">{hike?.description}</p>
            
            {/* Price and Availability */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Price per person</p>
                <p className="text-3xl font-bold text-primary">${hike?.price}</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  Availability: {hike?.availableSpots} spots left
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${hike ? (hike.bookedSpots / (hike.bookedSpots + hike.availableSpots)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Book Now Button */}
            <button
              onClick={handleStartBooking}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      );
      
    case BookingStep.SCHEDULE:
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Your Hike</h2>
              <button
                onClick={goBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Back to Details
              </button>
            </div>
            
            <CalBooking hikeId={hikeId} hikeName={hike?.name} />
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={goToPayment}
                className="py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      );
      
    case BookingStep.PAYMENT:
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment</h2>
              <button
                onClick={goToSchedule}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Back to Schedule
              </button>
            </div>
            
            <StripeCheckout 
              hike={hike} 
              onSuccess={goToConfirmation} 
              onCancel={goToSchedule} 
            />
          </div>
        </div>
      );
      
    case BookingStep.CONFIRMATION:
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking Confirmed!</h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your booking for <strong>{hike?.name}</strong> on <strong>{hike?.date}</strong> at <strong>{hike?.time}</strong> has been confirmed. 
              A confirmation email has been sent to <strong>{user?.email}</strong>.
            </p>
            
            <div className="max-w-md mx-auto p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6 text-left">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Booking Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking ID: DEMO-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date: {hike?.date}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time: {hike?.time}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location: {hike?.location}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid: ${hike?.price}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/hiker/dashboard')}
                className="py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => navigate('/hikes')}
                className="py-2 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                Browse More Hikes
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 text-sm">
              <p>Demo confirmation. In a real app, booking data would be stored in your database.</p>
            </div>
          </div>
        </div>
      );
  }
};

export default BookingSteps;
