
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Link, useLocation } from 'react-router-dom';
import { Booking } from '@/lib/types';
import BookingCard from './BookingCard';

interface UserBookingsProps {
  status?: 'completed';
}

const UserBookings = ({ status }: UserBookingsProps = {}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  
  const determineStatus = () => {
    if (status) return status;
    
    const path = location.pathname;
    if (path.includes('/completed')) return 'completed';
    return 'completed'; // Default to completed now
  };
  
  const currentStatus = determineStatus();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        let query = supabase
          .from('bookings')
          .select(`
            id, 
            hike_id, 
            booking_date, 
            booking_time, 
            status, 
            payment_status, 
            participants, 
            e_waiver_signed,
            reference,
            created_at,
            emergency_contact_name,
            emergency_contact_phone,
            hike:hikes(name, image, difficulty)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('booking_date', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedBookings: Booking[] = data.map(item => {
            const hikeData = Array.isArray(item.hike) ? item.hike[0] : item.hike;
            
            return {
              id: item.id,
              hikeId: item.hike_id,
              userId: user.id,
              bookingDate: item.booking_date,
              bookingTime: item.booking_time,
              status: item.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
              participants: item.participants,
              paymentStatus: item.payment_status as 'pending' | 'paid' | 'refunded',
              eWaiverSigned: item.e_waiver_signed,
              reference: item.reference,
              createdAt: item.created_at,
              customerName: '',
              customerEmail: '',
              emergencyContactName: item.emergency_contact_name,
              emergencyContactPhone: item.emergency_contact_phone,
              hike: hikeData ? {
                name: hikeData.name,
                image: hikeData.image,
                difficulty: hikeData.difficulty
              } : undefined
            };
          });
          
          setBookings(formattedBookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load your completed hikes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading your completed hikes...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Completed Hikes</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You don't have any completed hiking adventures yet. Your completed hikes will appear here.
        </p>
        <Button asChild>
          <Link to="/hikes">Browse Hikes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">
        Your Past Adventures
      </h3>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {bookings.map(booking => (
          <BookingCard 
            key={booking.id}
            booking={booking}
          />
        ))}
      </div>
    </div>
  );
};

export default UserBookings;
