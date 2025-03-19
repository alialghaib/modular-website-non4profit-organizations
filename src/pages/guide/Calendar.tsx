
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Booking, Hike, HikerParticipant } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GuideCalendarProps {
  onSelectDate: (date: Date | undefined) => void;
}

const GuideCalendar = ({ onSelectDate }: GuideCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hikeDates, setHikeDates] = useState<string[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchAssignedHikeDates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('hikes')
          .select('date')
          .eq('assigned_guide_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          // Extract the dates and format them
          const dates = data.map(hike => hike.date);
          setHikeDates(dates);
        }
      } catch (error) {
        console.error('Error fetching assigned hike dates:', error);
        toast.error('Failed to load your assigned hikes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignedHikeDates();
  }, [user]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onSelectDate(selectedDate);
  };

  // Check if a day has assigned hikes
  const isDayWithHike = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return hikeDates.includes(dayStr);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelect}
        className="rounded-md border"
        modifiers={{
          hasHike: (day) => isDayWithHike(day)
        }}
        modifiersStyles={{
          hasHike: { 
            fontWeight: 'bold',
            backgroundColor: 'rgba(62, 138, 106, 0.2)'
          }
        }}
      />
      
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Guide Schedule Legend:
        </p>
        <div className="mt-2 flex items-center">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">No hikes scheduled</span>
        </div>
        <div className="mt-1 flex items-center">
          <div className="w-4 h-4 bg-primary/20 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Hikes scheduled</span>
        </div>
      </div>
    </div>
  );
};

interface GuideScheduleProps {
  selectedDate: Date | undefined;
}

const GuideSchedule = ({ selectedDate }: GuideScheduleProps) => {
  const [assignedHikes, setAssignedHikes] = useState<Hike[]>([]);
  const [bookingsMap, setBookingsMap] = useState<Record<string, Booking[]>>({});
  const [participantsMap, setParticipantsMap] = useState<Record<string, HikerParticipant[]>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!selectedDate || !user) return;
    
    const fetchAssignedHikes = async () => {
      try {
        setLoading(true);
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        // Fetch hikes assigned to this guide on the selected date
        const { data: hikesData, error: hikesError } = await supabase
          .from('hikes')
          .select('*')
          .eq('assigned_guide_id', user.id)
          .eq('date', formattedDate);
        
        if (hikesError) throw hikesError;
        
        if (hikesData && hikesData.length > 0) {
          // Convert and properly type the hike data
          const typedHikes: Hike[] = hikesData.map(hike => {
            // Ensure difficulty is properly typed as one of the allowed values
            let typedDifficulty: 'easy' | 'moderate' | 'hard' = 'moderate'; // Default
            
            if (hike.difficulty === 'easy' || hike.difficulty === 'moderate' || hike.difficulty === 'hard') {
              typedDifficulty = hike.difficulty as 'easy' | 'moderate' | 'hard';
            }
            
            return {
              id: hike.id,
              name: hike.name,
              date: hike.date,
              time: hike.time,
              image: hike.image,
              description: hike.description,
              difficulty: typedDifficulty,
              location: hike.location,
              duration: hike.duration,
              guide: hike.guide,
              price: hike.price,
              availableSpots: hike.available_spots,
              bookedSpots: hike.booked_spots,
              assignedGuideId: hike.assigned_guide_id
            };
          });
          
          setAssignedHikes(typedHikes);
          
          // Fetch bookings for these hikes
          const hikeIds = hikesData.map(hike => hike.id);
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .in('hike_id', hikeIds);
          
          if (bookingsError) throw bookingsError;
          
          // Group bookings by hike_id
          const bookingsByHike: Record<string, Booking[]> = {};
          
          if (bookingsData && bookingsData.length > 0) {
            // Create participants from booking data
            const allParticipants: Record<string, HikerParticipant[]> = {};
            
            bookingsData.forEach(booking => {
              // Format booking data
              const formattedBooking: Booking = {
                id: booking.id,
                hikeId: booking.hike_id || '',
                userId: booking.user_id || '',
                bookingDate: booking.booking_date,
                bookingTime: booking.booking_time,
                status: booking.status as any,
                participants: booking.participants,
                paymentStatus: booking.payment_status as any,
                eWaiverSigned: booking.e_waiver_signed,
                eWaiverUrl: booking.e_waiver_url || undefined,
                customerName: booking.customer_name,
                customerEmail: booking.customer_email,
                customerPhone: booking.customer_phone || undefined,
                emergencyContactName: booking.emergency_contact_name || undefined,
                emergencyContactPhone: booking.emergency_contact_phone || undefined,
                reference: booking.reference || undefined,
                createdAt: booking.created_at
              };
              
              // Add booking to the map
              if (!bookingsByHike[booking.hike_id || '']) {
                bookingsByHike[booking.hike_id || ''] = [];
              }
              bookingsByHike[booking.hike_id || ''].push(formattedBooking);
              
              // Create a participant entry from the booking
              const participant: HikerParticipant = {
                id: booking.id, // Using booking ID as participant ID
                userId: booking.user_id || '',
                bookingId: booking.id,
                firstName: booking.customer_name.split(' ')[0] || '',
                lastName: booking.customer_name.split(' ').slice(1).join(' ') || '',
                email: booking.customer_email,
                phone: booking.customer_phone || undefined,
                emergencyContact: booking.emergency_contact_name || undefined,
                emergencyPhone: booking.emergency_contact_phone || undefined,
                eWaiverSigned: booking.e_waiver_signed,
                eWaiverUrl: booking.e_waiver_url || undefined
              };
              
              // Add participant to the map
              if (!allParticipants[booking.hike_id || '']) {
                allParticipants[booking.hike_id || ''] = [];
              }
              allParticipants[booking.hike_id || ''].push(participant);
            });
            
            setParticipantsMap(allParticipants);
          }
          
          setBookingsMap(bookingsByHike);
        } else {
          setAssignedHikes([]);
          setBookingsMap({});
          setParticipantsMap({});
        }
      } catch (error) {
        console.error('Error fetching assigned hikes:', error);
        toast.error('Failed to load your assigned hikes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignedHikes();
  }, [selectedDate, user]);

  if (!selectedDate) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">Select a date to view scheduled hikes</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Hikes for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </h2>
      
      {assignedHikes.length > 0 ? (
        <div className="space-y-8">
          {assignedHikes.map(hike => {
            const hikeBookings = bookingsMap[hike.id] || [];
            const hikeParticipants = participantsMap[hike.id] || [];
            const totalParticipants = hikeBookings.reduce((sum, booking) => sum + booking.participants, 0);
            
            return (
              <div key={hike.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{hike.name}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400 text-xs font-medium rounded-full">
                      {hike.time}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Hike Details</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-medium w-24">Location:</span> {hike.location || 'Not specified'}
                        </li>
                        <li className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-medium w-24">Duration:</span> {hike.duration || 'Not specified'}
                        </li>
                        <li className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-medium w-24">Difficulty:</span> {hike.difficulty || 'Not specified'}
                        </li>
                        <li className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-medium w-24">Participants:</span> {totalParticipants}
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Meeting Instructions</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Please arrive 15 minutes before the scheduled time. Meet at the visitor center parking lot.
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bring water, appropriate clothing, and comfortable hiking shoes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Participant List</h4>
                    
                    {hikeParticipants.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Contact
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Emergency Contact
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Waiver
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {hikeParticipants.map(participant => (
                              <tr key={participant.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {participant.firstName} {participant.lastName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {participant.phone && <div>{participant.phone}</div>}
                                  <div>{participant.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {participant.emergencyContact && <div>{participant.emergencyContact}</div>}
                                  {participant.emergencyPhone && <div>{participant.emergencyPhone}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {participant.eWaiverSigned ? (
                                    <a 
                                      href={participant.eWaiverUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-primary hover:underline"
                                    >
                                      View Waiver
                                    </a>
                                  ) : (
                                    <span className="text-red-500">Not Signed</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">No participants have signed up for this hike yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No hikes scheduled for this date</p>
        </div>
      )}
    </div>
  );
};

export { GuideCalendar, GuideSchedule };
