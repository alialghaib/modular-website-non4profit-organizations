import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CalBookingProps {
  hikeId?: string;
  hikeName?: string;
  onContinueToPayment?: () => void;
}

// Define time slot types based on hike duration
type TimeSlotSchedule = {
  short: string[];  // < 3 hours
  medium: string[]; // 3-6 hours
  long: string[];   // > 6 hours
}

const TIME_SLOTS: TimeSlotSchedule = {
  short: [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ],
  medium: [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "01:00 PM"
  ],
  long: [
    "08:00 AM", "09:00 AM", "10:00 AM"
  ]
};

const CalBooking = ({ hikeId, hikeName, onContinueToPayment }: CalBookingProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState(""); 
  const [emergencyPhone, setEmergencyPhone] = useState(""); 
  const [participants, setParticipants] = useState(1);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [availableSpots, setAvailableSpots] = useState(10);
  const [notes, setNotes] = useState(hikeId ? `Booking for hike ID: ${hikeId}` : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timeSlotCapacity, setTimeSlotCapacity] = useState<Record<string, Record<string, number>>>({});
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [hikeDuration, setHikeDuration] = useState<string>("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // New state to track if user already has a booking for this hike/time
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [isAuthenticated, user]);

  // Fetch hike details to get maxParticipantsPerTimeSlot and duration
  useEffect(() => {
    const fetchHikeDetails = async () => {
      if (!hikeId) return;
      
      try {
        console.log('Fetching hike details for:', hikeId);
        
        const { data, error } = await supabase
          .from('hikes')
          .select('*')
          .eq('id', hikeId)
          .single();
        
        if (error) {
          console.error('Error fetching hike:', error);
          return;
        }
        
        if (data) {
          // Set the max participants per time slot (default to 10 if not specified)
          setMaxParticipants(data.max_participants_per_time_slot || 10);
          console.log('Max participants per time slot:', data.max_participants_per_time_slot || 10);
          
          // Store the hike duration to determine available time slots
          setHikeDuration(data.duration || "");
          console.log('Hike duration:', data.duration);
        }
      } catch (error) {
        console.error('Error fetching hike details:', error);
      }
    };
    
    fetchHikeDetails();
  }, [hikeId]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!hikeId) return;
        
        console.log('Fetching bookings for hike:', hikeId);
        
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_date, booking_time, participants')
          .eq('hike_id', hikeId);
        
        if (error) {
          console.error('Error fetching bookings from Supabase:', error);
          return;
        }
        
        console.log('Fetched bookings:', data);
        
        if (!data || data.length === 0) {
          console.log('No bookings found for this hike');
          return;
        }
        
        // Group bookings by date and time to calculate participants per slot
        const bookingsBySlot: Record<string, Record<string, number>> = {};
        
        data.forEach(booking => {
          const date = booking.booking_date;
          const time = booking.booking_time;
          const participants = booking.participants || 1;
          
          if (!bookingsBySlot[date]) {
            bookingsBySlot[date] = {};
          }
          
          if (!bookingsBySlot[date][time]) {
            bookingsBySlot[date][time] = 0;
          }
          
          bookingsBySlot[date][time] += participants;
        });
        
        // Determine available time slots based on hike duration
        const hikeTimeSlots = getTimeSlotsBasedOnDuration(hikeDuration);
        
        // Find dates where all time slots are at max capacity
        const fullyBookedDates = Object.entries(bookingsBySlot)
          .filter(([date, timeSlots]) => {
            // Check if ALL time slots for this date are at or above max capacity
            return Object.values(timeSlots).every(count => count >= maxParticipants) && 
                   Object.keys(timeSlots).length >= hikeTimeSlots.length;
          })
          .map(([date]) => date);
        
        setBookedDates(fullyBookedDates);
        
        // Store the time slot capacity information for later use
        setTimeSlotCapacity(bookingsBySlot);
        
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    
    fetchBookings();
  }, [hikeId, maxParticipants, hikeDuration]);

  // Helper function to determine time slots based on hike duration
  const getTimeSlotsBasedOnDuration = (duration: string): string[] => {
    if (!duration) return TIME_SLOTS.medium; // Default to medium if no duration specified
    
    // Parse duration to get hours
    let hours = 0;
    
    if (duration.includes('hour')) {
      // Extract hours from strings like "2 hours" or "2.5 hours"
      const match = duration.match(/(\d+(\.\d+)?)\s*hour/);
      if (match && match[1]) {
        hours = parseFloat(match[1]);
      }
    } else if (duration.includes('min')) {
      // Extract minutes from strings like "90 minutes" and convert to hours
      const match = duration.match(/(\d+)\s*min/);
      if (match && match[1]) {
        hours = parseInt(match[1]) / 60;
      }
    }
    
    console.log(`Interpreted hike duration as ${hours} hours`);
    
    // Categorize based on hours
    if (hours < 3) {
      return TIME_SLOTS.short;
    } else if (hours <= 6) {
      return TIME_SLOTS.medium;
    } else {
      return TIME_SLOTS.long;
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    
    const updateAvailableTimes = async () => {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        console.log('Checking availability for date:', formattedDate);
        
        // Get appropriate time slots based on hike duration
        const hikeTimeSlots = getTimeSlotsBasedOnDuration(hikeDuration);
        console.log('Time slots for this hike duration:', hikeTimeSlots);
        
        const { data, error } = await supabase
          .from('bookings')
          .select('booking_time, participants')
          .eq('hike_id', hikeId)
          .eq('booking_date', formattedDate);
        
        if (error) {
          console.error('Error fetching times from Supabase:', error);
          setAvailableTimes(hikeTimeSlots);
          return;
        }
        
        console.log('Fetched booked times:', data);
        
        // Calculate participants per time slot
        const participantsByTime: Record<string, number> = {};
        
        data?.forEach(booking => {
          const time = booking.booking_time;
          const participants = booking.participants || 1;
          
          if (!participantsByTime[time]) {
            participantsByTime[time] = 0;
          }
          
          participantsByTime[time] += participants;
        });
        
        // Check which time slots still have capacity
        const available = hikeTimeSlots.filter(time => {
          const bookedParticipants = participantsByTime[time] || 0;
          return bookedParticipants < maxParticipants;
        });
        
        setAvailableTimes(available);
        
        // For the selected time, calculate remaining spots
        if (selectedTime) {
          const bookedParticipants = participantsByTime[selectedTime] || 0;
          setAvailableSpots(maxParticipants - bookedParticipants);
        }
        
        if (selectedTime && !available.includes(selectedTime)) {
          setSelectedTime("");
        }
      } catch (error) {
        console.error("Error updating available times:", error);
        setAvailableTimes(getTimeSlotsBasedOnDuration(hikeDuration));
      }
    };
    
    updateAvailableTimes();
  }, [selectedDate, hikeId, maxParticipants, selectedTime, hikeDuration]);

  // Update available spots when time is selected
  useEffect(() => {
    if (!selectedDate || !selectedTime) return;
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const dateCapacity = timeSlotCapacity[formattedDate] || {};
    const bookedParticipants = dateCapacity[selectedTime] || 0;
    
    setAvailableSpots(maxParticipants - bookedParticipants);
    
    // Reset participants to 1 or the max available
    setParticipants(Math.min(1, availableSpots));
    
  }, [selectedTime, selectedDate, timeSlotCapacity, maxParticipants, availableSpots]);

  // Check if user already has a booking for this hike at the selected time
  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!user || !hikeId || !selectedDate || !selectedTime) return;
      
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', user.id)
          .eq('hike_id', hikeId)
          .eq('booking_date', formattedDate)
          .eq('booking_time', selectedTime)
          .eq('status', 'confirmed')
          .maybeSingle();
        
        if (error) {
          console.error('Error checking existing booking:', error);
          return;
        }
        
        if (data) {
          console.log('User already has a booking for this hike at this time:', data);
          setAlreadyBooked(true);
          toast.warning('You already have a booking for this hike at this time');
        } else {
          setAlreadyBooked(false);
        }
      } catch (error) {
        console.error('Error checking booking:', error);
      }
    };
    
    checkExistingBooking();
  }, [hikeId, selectedDate, selectedTime, user]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const generateBookingReference = () => {
    const prefix = "HIKE";
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${randomNum}-${randomChars}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }
    
    if (!name || !email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (participants < 1) {
      toast.error("Number of participants must be at least 1");
      return;
    }
    
    if (participants > availableSpots) {
      toast.error(`Only ${availableSpots} spots available for this time slot`);
      return;
    }
    
    if (!emergencyName || !emergencyPhone) {
      toast.error("Please provide emergency contact information");
      return;
    }

    if (alreadyBooked) {
      toast.error("You already have a booking for this hike at this time");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reference = generateBookingReference();
      setBookingReference(reference);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const bookingData = {
        hike_id: hikeId,
        user_id: user?.id || null,
        booking_date: formattedDate,
        booking_time: selectedTime,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        notes: notes,
        status: 'confirmed',
        reference: reference,
        participants: participants
      };

      console.log('Creating booking in Supabase:', bookingData);
      setBookingDetails(bookingData);
      
      if (isAuthenticated && user) {
        const { data, error } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select();
        
        if (error) {
          console.error('Failed to save booking to database:', error);
          toast.error('Failed to save booking. Please try again.');
          setIsSubmitting(false);
          return;
        } else {
          console.log('Booking saved to database:', data);
          
          if (data && data[0]) {
            localStorage.setItem('currentBookingId', data[0].id);
          }
        }
      } else {
        toast.error("You must be logged in to book a hike");
        navigate('/login');
        setIsSubmitting(false);
        return;
      }
      
      toast.success("Hiking adventure booked successfully!");
      
      if (onContinueToPayment) {
        localStorage.setItem('currentBookingDetails', JSON.stringify(bookingData));
        onContinueToPayment();
      } else {
        setBookingConfirmed(true);
      }
      
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewBooking = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setParticipants(1);
    setEmergencyName("");
    setEmergencyPhone("");
    setNotes(hikeId ? `Booking for hike ID: ${hikeId}` : "");
    setBookingConfirmed(false);
    setBookingReference("");
    setBookingDetails(null);
  };

  return (
    <div className="h-full w-full">
      {bookingConfirmed ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your booking reference is: <span className="font-bold">{bookingReference}</span>
          </p>
          
          <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 text-left">
            <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
            <p className="mb-1"><span className="font-medium">Hike:</span> {hikeName}</p>
            <p className="mb-1"><span className="font-medium">Date:</span> {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</p>
            <p className="mb-1"><span className="font-medium">Time:</span> {selectedTime}</p>
            <p className="mb-1"><span className="font-medium">Name:</span> {name}</p>
            <p className="mb-1"><span className="font-medium">Email:</span> {email}</p>
            <p className="mb-1"><span className="font-medium">Participants:</span> {participants}</p>
            {phone && <p className="mb-1"><span className="font-medium">Phone:</span> {phone}</p>}
            <p className="mb-1"><span className="font-medium">Emergency Contact:</span> {emergencyName}</p>
            <p className="mb-1"><span className="font-medium">Emergency Phone:</span> {emergencyPhone}</p>
          </div>
          
          <div className="max-w-md mx-auto p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-left">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Next Steps</h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-2">Please download and complete the E-Waiver form before your hike. You can submit it anytime before your scheduled hike date.</p>
            <a 
              href="/waiver-template.pdf" 
              download 
              className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download E-Waiver
            </a>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={handleNewBooking}
              className="bg-primary hover:bg-primary/90"
            >
              Book Another Adventure
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/hikes')}
            >
              Browse More Hikes
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Book Your Adventure</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {hikeName ? `Reserve your spot for ${hikeName}` : 'Select a date and time for your hiking adventure'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">Select Date & Time</h3>
              
              <div className="mb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    const dateString = format(date, 'yyyy-MM-dd');
                    
                    return (
                      date < new Date() || 
                      date.getDay() === 0 || 
                      date.getDay() === 6 || 
                      bookedDates.includes(dateString)
                    );
                  }}
                  className="rounded-md border"
                />
              </div>
              
              {selectedDate && (
                <div className="mb-4">
                  <Label htmlFor="time" className="block mb-2">
                    Available Times for {format(selectedDate, 'MMMM d, yyyy')}
                    {availableTimes.length === 0 && (
                      <span className="text-red-500 ml-2">(No times available)</span>
                    )}
                  </Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime} disabled={availableTimes.length === 0}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {selectedTime && (
                <div className="mb-4">
                  <Label htmlFor="participants" className="block mb-2">
                    Number of Participants ({availableSpots} spots available)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => setParticipants(prev => Math.max(1, prev - 1))}
                      disabled={participants <= 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/>
                      </svg>
                    </Button>
                    <span className="w-8 text-center">{participants}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => setParticipants(prev => Math.min(availableSpots, prev + 1))}
                      disabled={participants >= availableSpots}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">Your Information</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="block mb-2">Full Name *</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="block mb-2">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="block mb-2">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <Label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Emergency Contact Information *</Label>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="emergencyName" className="block mb-1 text-sm">Name *</Label>
                      <Input 
                        id="emergencyName" 
                        value={emergencyName} 
                        onChange={(e) => setEmergencyName(e.target.value)} 
                        required 
                        placeholder="Emergency contact name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emergencyPhone" className="block mb-1 text-sm">Phone *</Label>
                      <Input 
                        id="emergencyPhone" 
                        type="tel" 
                        value={emergencyPhone} 
                        onChange={(e) => setEmergencyPhone(e.target.value)} 
                        required 
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="block mb-2">Additional Notes</Label>
                  <Input 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Any special requirements or information"
                  />
                </div>
                
                {selectedDate && selectedTime && alreadyBooked && (
                  <div className="p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-amber-700 dark:text-amber-300">
                    You already have a booking for this hike at this time.
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!selectedDate || !selectedTime || !name || !email || !emergencyName || !emergencyPhone || isSubmitting || participants < 1 || participants > availableSpots || alreadyBooked}
                >
                  {isSubmitting ? "Booking..." : onContinueToPayment ? "Continue to Payment" : "Reserve Your Spot"}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">How Booking Works</h3>
            <p className="text-green-700 dark:text-green-300 mb-2">
              Simply select an available date and time on the calendar. Unavailable times will be grayed out.
              Each time slot has a maximum capacity of {maxParticipants} participants.
            </p>
            <p className="text-green-700 dark:text-green-300">
              Time slots are based on hike duration - longer hikes have morning start times only, 
              while shorter hikes offer more flexible scheduling throughout the day.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalBooking;
