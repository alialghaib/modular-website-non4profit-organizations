
import { useEffect } from 'react';
import Cal from "@calcom/embed-react";
import { getCalApi } from "@calcom/embed-react";
import { useAuth } from '@/context/AuthContext';

interface CalBookingProps {
  hikeId?: string;
  hikeName?: string;
}

const CalBooking = ({ hikeId, hikeName }: CalBookingProps) => {
  const { user } = useAuth();

  // Initialize Cal.com widget
  useEffect(() => {
    const initCal = async () => {
      const cal = await getCalApi();
      cal("ui", {
        styles: { branding: { brandColor: "#3e8a6a" } },
        hideEventTypeDetails: false,
      });
    };
    
    initCal();
  }, []);

  // Demo username - replace with real Cal.com account in production
  const calUsername = 'your-cal-username';

  return (
    <div className="h-full w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Book Your Adventure</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {hikeName ? `Reserve your spot for ${hikeName}` : 'Select a date and time for your hiking adventure'}
        </p>
      </div>
      
      <Cal 
        calLink={calUsername}
        style={{ width: '100%', height: '100%', minHeight: '600px' }}
        config={{
          name: user ? `${user.firstName} ${user.lastName}` : undefined,
          email: user?.email,
          notes: hikeId ? `Booking for hike ID: ${hikeId}` : undefined,
          theme: 'light',
        }}
      />
      
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">Demo Mode</h3>
        <p className="text-yellow-700 dark:text-yellow-300">
          This booking interface uses Cal.com integration. Connect with your Cal.com account and configure booking types to match your hiking options.
        </p>
      </div>
    </div>
  );
};

export default CalBooking;
