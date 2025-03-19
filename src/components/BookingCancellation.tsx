
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Booking } from '@/lib/types';
import { toast } from 'sonner';
import { processCancelationRefund } from '@/lib/stripe';

interface BookingCancellationProps {
  booking: Booking;
  onCancelled: () => void;
  disableRefund?: boolean;
}

const BookingCancellation = ({ booking, onCancelled, disableRefund = false }: BookingCancellationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [canRefund, setCanRefund] = useState<boolean | null>(null);
  const { user } = useAuth();

  // Function to check if cancellation is within 24 hours of hike time
  const checkRefundEligibility = (): boolean => {
    if (disableRefund) return false;
    
    if (!booking.bookingDate || !booking.bookingTime) return false;
    
    // Create a Date object for the hike time
    const [hours, minutes] = booking.bookingTime.split(':').map(Number);
    const hikeDate = new Date(booking.bookingDate);
    hikeDate.setHours(hours, minutes, 0, 0);
    
    // Calculate the difference in hours
    const now = new Date();
    const diffInHours = (hikeDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Eligible for refund if more than 24 hours before hike
    return diffInHours >= 24;
  };

  const handleOpenDialog = () => {
    const isEligible = checkRefundEligibility();
    setCanRefund(isEligible);
    setIsOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!user || !booking.id) return;
    
    setProcessing(true);
    
    try {
      // First update the booking status in the database
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          payment_status: canRefund ? 'refunded' : 'cancelled'
        })
        .eq('id', booking.id)
        .eq('user_id', user.id);
      
      if (updateError) {
        throw new Error(`Failed to update booking: ${updateError.message}`);
      }
      
      // Process refund if eligible
      if (canRefund && booking.reference) {
        const refundResult = await processCancelationRefund(booking.reference);
        
        if (!refundResult.success) {
          console.error('Refund processing error:', refundResult.error);
          toast.error('Your booking was cancelled but there was an issue processing your refund. Our team will contact you.');
        } else {
          toast.success('Your booking has been cancelled and a refund has been processed');
        }
      } else {
        toast.success('Your booking has been cancelled');
      }
      
      // Close dialog and notify parent component
      setIsOpen(false);
      onCancelled();
      
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-300"
        onClick={handleOpenDialog}
      >
        Cancel Booking
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking for {booking.hike?.name}?
            </DialogDescription>
          </DialogHeader>
          
          {canRefund !== null && (
            <Alert className={canRefund ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"}>
              <AlertDescription>
                {canRefund 
                  ? "Your cancellation is more than 24 hours before the hike. You will receive a full refund."
                  : "Your cancellation is less than 24 hours before the hike. No refund will be processed according to our cancellation policy."}
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking} 
              disabled={processing}
            >
              {processing ? "Processing..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingCancellation;
