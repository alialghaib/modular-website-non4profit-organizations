
// We'll only update the specific parts of BookingSteps that need to interact with Supabase

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hike } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import CalBooking from './CalBooking';
import StripeCheckout from './StripeCheckout';
import EWaiverUploader from './EWaiverUploader';
import { toast } from 'sonner';
import { sendBookingConfirmation, sendBookingNotificationToAdmin } from '@/lib/email';
import { supabase } from '@/lib/supabase';
import TimeSlotSelector from '@/components/TimeSlotSelector';

interface BookingStepsProps {
  hike: Hike;
  hikeId?: string;
}

// Booking process steps
enum BookingStep {
  DETAILS,
  SCHEDULE,
  PAYMENT,
  WAIVER,
  CONFIRMATION
}

const BookingSteps = ({ hike, hikeId }: BookingStepsProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.DETAILS);
  const [bookingId, setBookingId] = useState<string>('');
  const [waiverUrl, setWaiverUrl] = useState<string>('');
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // New state for the selected time slot
  const [selectedSlot, setSelectedSlot] = useState<string>('');

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
  const goToWaiver = () => setCurrentStep(BookingStep.WAIVER);
  const goToConfirmation = () => setCurrentStep(BookingStep.CONFIRMATION);
  const goBack = () => setCurrentStep(BookingStep.DETAILS);

  // Get booking details from localStorage when proceeding to payment
  useEffect(() => {
    if (currentStep === BookingStep.PAYMENT) {
      try {
        const bookingData = localStorage.getItem('currentBookingDetails');
        if (bookingData) {
          setCurrentBooking(JSON.parse(bookingData));
        }
      } catch (error) {
        console.error('Error retrieving booking details:', error);
      }
    }
  }, [currentStep]);

  // Handle payment success
  const handlePaymentSuccess = async () => {
    try {
      if (!user || !hikeId) return;

      // Get the booking ID from localStorage
      const bookingId = localStorage.getItem('currentBookingId');

      if (bookingId) {
        console.log('Using existing booking ID:', bookingId);
        setBookingId(bookingId);
      } else {
        console.log('No booking ID found in localStorage');

        // Check if we need to create a booking record in Supabase
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            hike_id: hikeId,
            user_id: user.id,
            booking_date: currentBooking?.booking_date || new Date().toISOString().split('T')[0],
            booking_time: currentBooking?.booking_time || new Date().toLocaleTimeString(),
            customer_name: currentBooking?.customer_name || `${user.firstName} ${user.lastName}`,
            customer_email: currentBooking?.customer_email || user.email,
            customer_phone: user.phone || '',
            status: 'confirmed',
            payment_status: 'paid',
            participants: 1,
            reference: currentBooking?.reference || `HIKE-${Math.floor(Math.random() * 100000)}`
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating booking:', error);
          toast.error('Failed to create booking record');
        } else if (data) {
          console.log('Created new booking:', data);
          setBookingId(data.id);
          localStorage.setItem('currentBookingId', data.id);
        }
      }

      // Send confirmation email
      await sendBookingConfirmation(
        user,
        hike.name,
        hike.date,
        hike.time
      );

      // Send notification to admin (if this was a real app)
      // In demo mode, we'll log this but not actually send
      console.log('Would send admin notification email for new booking');

      // Proceed to waiver step
      goToWaiver();
    } catch (error) {
      console.error('Error in payment success handler:', error);
      // Even if there's an error, show success to the user
      // In a real app, you'd want better error handling
      goToWaiver();
    }
  };

  // Handle waiver success
  const handleWaiverSuccess = async (url: string) => {
    setWaiverUrl(url);

    try {
      // Update the booking record with the waiver URL
      const bookingId = localStorage.getItem('currentBookingId');

      if (bookingId) {
        console.log('Updating booking with waiver URL:', bookingId);

        const { error } = await supabase
          .from('bookings')
          .update({
            e_waiver_signed: true,
            e_waiver_url: url
          })
          .eq('id', bookingId);

        if (error) {
          console.error('Error updating booking with waiver URL:', error);
        } else {
          console.log('Booking updated with waiver URL');
        }
      }
    } catch (error) {
      console.error('Error updating waiver URL:', error);
    }

    setTimeout(() => {
      goToConfirmation();
    }, 1000);
  };

  // Render content based on current step
  switch (currentStep) {
    case BookingStep.DETAILS:
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="relative h-64 md:h-80">
            <img
              src={hike?.image}
              alt={hike?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${hike?.difficulty === 'easy' ? 'bg-green-500 text-white' :
                  hike?.difficulty === 'moderate' ? 'bg-yellow-500 text-gray-900' :
                    'bg-red-500 text-white'
                  }`}>
                  {hike?.difficulty}
                </span>
                <span className="text-white text-sm">{hike?.duration}</span>
              </div>
            </div>
          </div>

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

            <button
              onClick={handleStartBooking}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
              disabled={!hike?.availableSpots || hike?.availableSpots <= 0}
            >
              {!hike?.availableSpots || hike?.availableSpots <= 0
                ? 'Sold Out'
                : 'Book Now'
              }
            </button>
          </div>
        </div>
      );

      case BookingStep.SCHEDULE:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Schedule Your Hike
                </h2>
                <button
                  onClick={goBack}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Back to Details
                </button>
              </div>
      
              {/* Render the CalBooking component, which should include your interactive calendar and fields */}
              <CalBooking
                hikeId={hikeId}
                hikeName={hike?.name}
                onContinueToPayment={goToPayment}
              />
      
              {/* 
                If you previously had additional fields (like client booking info and emergency contact info)
                inside CalBooking, ensure that component's code is not conditionally hiding those fields.
                Check CalBooking.tsx for any conditions or props that might be causing the fields to not appear.
              */}
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
              onSuccess={handlePaymentSuccess}
              onCancel={goToSchedule}
            />
          </div>
        </div>
      );

    case BookingStep.WAIVER:
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-Waiver</h2>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                Please upload a signed e-waiver form before your hike. This is required for all participants.
              </p>
            </div>

            <EWaiverUploader
              hikeId={hikeId || ''}
              bookingId={bookingId}
              onSuccess={handleWaiverSuccess}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={goToConfirmation}
                className="py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Skip for Now
              </button>
            </div>
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

            {!waiverUrl && (
              <div className="max-w-md mx-auto p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-6 text-left">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">E-Waiver Pending</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Please remember to submit your e-waiver before the hike. You can do this from your dashboard.
                </p>
              </div>
            )}

            <div className="max-w-md mx-auto p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6 text-left">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Booking Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking ID: {bookingId || `DEMO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`}</p>
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
          </div>
        </div>
      );
  }
};

export default BookingSteps;
