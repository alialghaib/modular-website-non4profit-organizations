
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { toast } from 'sonner';
import { Hike } from '@/lib/types';

interface AssignableHike extends Hike {
  isAssigned: boolean;
  isAssignedToMe: boolean;
  canAssign: boolean;
}

const GuideHikeAssignment = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hikes, setHikes] = useState<AssignableHike[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState<string | null>(null);

  useEffect(() => {
    if (user && date) {
      fetchHikesForDate(format(date, 'yyyy-MM-dd'));
    }
  }, [user, date]);

  const fetchHikesForDate = async (dateStr: string) => {
    try {
      setLoading(true);
      
      // Get guide's availability for the day of week
      const dayOfWeek = date ? date.getDay() : new Date().getDay();
      
      console.log('Fetching availability for day of week:', dayOfWeek);
      console.log('User ID:', user?.id);
      
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('guide_availability')
        .select('*')
        .eq('guide_id', user?.id)
        .eq('day_of_week', dayOfWeek);
      
      if (availabilityError) {
        console.error('Error fetching availability:', availabilityError);
        throw availabilityError;
      }
      
      console.log('Availability data:', availabilityData);
      
      // Fetch all hikes for the selected date
      const { data: hikesData, error: hikesError } = await supabase
        .from('hikes')
        .select('*')
        .eq('date', dateStr);
      
      if (hikesError) {
        console.error('Error fetching hikes:', hikesError);
        throw hikesError;
      }
      
      console.log('Hikes data:', hikesData);
      
      // Also fetch my assigned hikes for any date to check for conflicts
      const { data: myAssignedHikes, error: assignedError } = await supabase
        .from('hikes')
        .select('*')
        .eq('assigned_guide_id', user?.id);
        
      if (assignedError) {
        console.error('Error fetching assigned hikes:', assignedError);
        // Continue anyway, just won't have conflict detection
      }
      
      console.log('My assigned hikes:', myAssignedHikes);
      
      // Process hikes to determine if guide can be assigned
      const processedHikes: AssignableHike[] = hikesData.map(hike => {
        const isAssigned = !!hike.assigned_guide_id;
        const isAssignedToMe = hike.assigned_guide_id === user?.id;
        
        // Check if the guide is available for this hike time
        let canAssign = false;
        
        if (!isAssigned || isAssignedToMe) {
          // If there's no availability data yet, allow assignment (for testing)
          if (availabilityData.length === 0) {
            canAssign = true;
          } else {
            canAssign = availabilityData.some(availability => {
              // Extract just the hour for simplified matching
              const hikeHour = parseInt(hike.time.split(':')[0]);
              const startHour = parseInt(availability.start_time.split(':')[0]);
              const endHour = parseInt(availability.end_time.split(':')[0]);
              
              return startHour <= hikeHour && hikeHour <= endHour;
            });
          }
        }
        
        // Check if the hike is in the future (can't assign to past hikes)
        const hikeDateTime = new Date(`${hike.date}T${hike.time}`);
        if (isBefore(hikeDateTime, new Date())) {
          canAssign = false;
        }
        
        // For already assigned hikes to others, never allow assignment
        if (isAssigned && !isAssignedToMe) {
          canAssign = false;
        }
        
        return {
          ...hike,
          isAssigned,
          isAssignedToMe,
          canAssign
        };
      });
      
      setHikes(processedHikes);
    } catch (error) {
      console.error('Error fetching hikes:', error);
      toast.error('Failed to load hikes');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if two hikes have time conflicts
  const hasTimeConflict = (hike1: Hike, hike2: Hike) => {
    // Different dates don't conflict
    if (hike1.date !== hike2.date) {
      return false;
    }
    
    // Simple hour-based conflict detection
    const hike1Hour = parseInt(hike1.time.split(':')[0]);
    const hike2Hour = parseInt(hike2.time.split(':')[0]);
    
    // For simplicity, we'll assume hikes take 1-3 hours based on difficulty
    const getDurationHours = (hike: Hike) => {
      if (hike.difficulty === 'easy') return 1;
      if (hike.difficulty === 'moderate') return 2;
      return 3; // hard
    };
    
    const hike1Duration = getDurationHours(hike1);
    const hike2Duration = getDurationHours(hike2);
    
    // Check if hike1 overlaps with hike2
    const hike1End = hike1Hour + hike1Duration;
    const hike2End = hike2Hour + hike2Duration;
    
    return (
      (hike1Hour <= hike2Hour && hike2Hour < hike1End) || 
      (hike2Hour <= hike1Hour && hike1Hour < hike2End)
    );
  };

  const assignHike = async (hikeId: string) => {
    try {
      setLoadingAssign(hikeId);
      
      console.log('Assigning hike:', hikeId, 'to guide:', user?.id);
      
      // First check if hike is already assigned
      const { data: hikeData, error: hikeCheckError } = await supabase
        .from('hikes')
        .select('*')
        .eq('id', hikeId)
        .single();
        
      if (hikeCheckError) {
        console.error('Error checking hike assignment:', hikeCheckError);
        throw hikeCheckError;
      }
      
      if (hikeData.assigned_guide_id && hikeData.assigned_guide_id !== user?.id) {
        throw new Error('This hike is already assigned to another guide');
      }
      
      // Check for conflicts with other hikes assigned to this guide
      const { data: myAssignedHikes, error: assignedError } = await supabase
        .from('hikes')
        .select('*')
        .eq('assigned_guide_id', user?.id);
        
      if (assignedError) {
        console.error('Error fetching assigned hikes:', assignedError);
        // We'll continue anyway but log the error
      } else if (myAssignedHikes) {
        // Find any conflicts with existing assignments
        const conflicts = myAssignedHikes.filter(myHike => 
          myHike.id !== hikeId && hasTimeConflict(hikeData, myHike)
        );
        
        if (conflicts.length > 0) {
          console.error('Time conflicts detected:', conflicts);
          throw new Error(`Cannot assign to this hike due to time conflict with ${conflicts.length} other hike(s) you're assigned to on the same day`);
        }
      }
      
      const { data, error } = await supabase
        .from('hikes')
        .update({ assigned_guide_id: user?.id })
        .eq('id', hikeId)
        .select();
      
      if (error) {
        console.error('Error assigning to hike:', error);
        throw error;
      }
      
      console.log('Assignment result:', data);
      
      toast.success('You have been assigned to this hike successfully');
      
      // Update the local state
      setHikes(hikes.map(hike => 
        hike.id === hikeId 
          ? { ...hike, isAssigned: true, isAssignedToMe: true } 
          : hike
      ));
    } catch (error) {
      console.error('Error assigning to hike:', error);
      let errorMessage = 'Failed to assign to hike';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast.error(errorMessage);
    } finally {
      setLoadingAssign(null);
    }
  };

  const unassignHike = async (hikeId: string) => {
    try {
      setLoadingAssign(hikeId);
      
      console.log('Unassigning hike:', hikeId, 'from guide:', user?.id);
      
      const { data, error } = await supabase
        .from('hikes')
        .update({ assigned_guide_id: null })
        .eq('id', hikeId)
        .eq('assigned_guide_id', user?.id) // Only allow unassigning own hikes
        .select();
      
      if (error) {
        console.error('Error unassigning from hike:', error);
        throw error;
      }
      
      console.log('Unassignment result:', data);
      
      toast.success('You have been unassigned from this hike');
      
      // Update the local state
      setHikes(hikes.map(hike => 
        hike.id === hikeId 
          ? { ...hike, isAssigned: false, isAssignedToMe: false } 
          : hike
      ));
    } catch (error) {
      console.error('Error unassigning from hike:', error);
      toast.error('Failed to unassign from hike');
    } finally {
      setLoadingAssign(null);
    }
  };

  // Only allow selecting today or future dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  };

  if (loading) {
    return <div className="text-center p-6">Loading hikes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Select Date</h3>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={isDateDisabled}
            className="mx-auto"
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold p-6 pb-2">
          Hikes for {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}
        </h3>
        
        {hikes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hikes scheduled for this date.
          </div>
        ) : (
          <div className="p-6 pt-2 space-y-4">
            {hikes.map((hike) => (
              <div 
                key={hike.id} 
                className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900"
              >
                <div className="md:flex">
                  <div className="md:w-1/4 h-40 md:h-auto">
                    <img 
                      src={hike.image} 
                      alt={hike.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4 md:w-3/4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold">{hike.name}</h4>
                        <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                          {hike.time}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>{hike.location}</span>
                        <span>•</span>
                        <span>{hike.duration}</span>
                        <span>•</span>
                        <span className={`font-medium ${
                          hike.difficulty === 'easy' 
                            ? 'text-green-600 dark:text-green-400' 
                            : hike.difficulty === 'moderate'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {hike.difficulty}
                        </span>
                      </div>
                      
                      <div className="text-sm mb-4">
                        <span className="font-medium">Status: </span>
                        {hike.isAssigned ? (
                          hike.isAssignedToMe ? (
                            <span className="text-green-600 dark:text-green-400">Assigned to you</span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">Assigned to another guide</span>
                          )
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">Needs a guide</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {hike.isAssignedToMe ? (
                        <Button 
                          variant="outline" 
                          className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-red-300 hover:bg-red-50"
                          onClick={() => unassignHike(hike.id)}
                          disabled={!!loadingAssign}
                        >
                          {loadingAssign === hike.id ? 'Processing...' : 'Remove Assignment'}
                        </Button>
                      ) : (
                        hike.canAssign && !hike.isAssigned && (
                          <Button 
                            variant="default"
                            onClick={() => assignHike(hike.id)}
                            disabled={!!loadingAssign}
                          >
                            {loadingAssign === hike.id ? 'Processing...' : 'Assign Me to this Hike'}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideHikeAssignment;
