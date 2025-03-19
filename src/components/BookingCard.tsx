
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Booking } from '@/lib/types';
import BookingCancellation from '@/components/BookingCancellation';

interface BookingCardProps {
  booking: Booking;
  onUploadWaiver?: (hikeId: string, bookingId: string) => void;
}

const BookingCard = ({ booking, onUploadWaiver }: BookingCardProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isPastHike = () => {
    if (!booking.bookingDate) return false;
    
    const hikeDate = new Date(booking.bookingDate);
    const today = new Date();
    
    // Compare dates without time
    return hikeDate < new Date(today.setHours(0, 0, 0, 0));
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleBookingCancelled = () => {
    handleRefresh();
  };

  // Check if we're within 24 hours of the hike
  const isWithin24Hours = () => {
    if (!booking.bookingDate || !booking.bookingTime) return true;
    
    const dateStr = booking.bookingDate;
    const timeStr = booking.bookingTime;
    
    // Create a date object from the booking date and time
    const [year, month, day] = dateStr.split('-').map(Number);
    let hour = 0;
    let minute = 0;
    
    // Parse time in formats like "9:00 AM" or "2:30 PM"
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
      if (timeMatch) {
        hour = parseInt(timeMatch[1]);
        minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        
        // Convert to 24-hour format
        if (timeMatch[3].toUpperCase() === 'PM' && hour < 12) {
          hour += 12;
        } else if (timeMatch[3].toUpperCase() === 'AM' && hour === 12) {
          hour = 0;
        }
      }
    }
    
    const hikeDateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    
    // Calculate time difference in hours
    const diffHours = (hikeDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Return true if we're within 24 hours of the hike start time
    return diffHours <= 24;
  };

  return (
    <Card className="overflow-hidden">
      {booking.hike?.image && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={booking.hike.image} 
            alt={booking.hike?.name || 'Hike'} 
            className="w-full h-full object-cover"
          />
          {booking.hike?.difficulty && (
            <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold uppercase ${
              booking.hike.difficulty === 'easy' ? 'bg-green-500 text-white' :
              booking.hike.difficulty === 'moderate' ? 'bg-yellow-500 text-gray-900' :
              'bg-red-500 text-white'
            }`}>
              {booking.hike.difficulty}
            </span>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{booking.hike?.name || 'Unknown Hike'}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {booking.bookingDate} at {booking.bookingTime}
            </p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Participants:</span>
            <span>{booking.participants}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
            <span className="font-mono text-xs">{booking.id.slice(0, 8)}...</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">E-Waiver:</span>
            <span>{booking.eWaiverSigned ? 'Signed' : 'Pending'}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-wrap gap-2">
        {!booking.eWaiverSigned && booking.status === 'confirmed' && !isPastHike() && onUploadWaiver && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onUploadWaiver(booking.hikeId, booking.id)}
            className="flex-1"
          >
            Upload Waiver
          </Button>
        )}
        
        {booking.status === 'confirmed' && !isPastHike() && (
          <BookingCancellation 
            booking={booking} 
            onCancelled={handleBookingCancelled} 
            disableRefund={isWithin24Hours()}
          />
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
