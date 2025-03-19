
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  dayName: string;
}

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const GuideAvailability = () => {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: 1, // Monday by default
    startTime: '09:00',
    endTime: '17:00',
  });

  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching availability for user:', user?.id);
      
      const { data, error } = await supabase
        .from('guide_availability')
        .select('*')
        .eq('guide_id', user?.id);
      
      if (error) {
        console.error('Error fetching availability:', error);
        throw error;
      }
      
      console.log('Availability data from DB:', data);
      
      const formattedData = data.map(item => ({
        id: item.id,
        dayOfWeek: item.day_of_week,
        startTime: item.start_time,
        endTime: item.end_time,
        dayName: daysOfWeek.find(d => d.value === item.day_of_week)?.label || 'Unknown'
      }));
      
      setAvailabilities(formattedData);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load your availability schedule');
    } finally {
      setLoading(false);
    }
  };

  const addAvailability = async () => {
    try {
      if (!user) return;
      
      console.log('Adding availability:', newAvailability, 'for user:', user.id);
      
      const { data, error } = await supabase
        .from('guide_availability')
        .insert({
          guide_id: user.id,
          day_of_week: newAvailability.dayOfWeek,
          start_time: newAvailability.startTime,
          end_time: newAvailability.endTime,
        })
        .select();
      
      if (error) {
        console.error('Error adding availability:', error);
        throw error;
      }
      
      console.log('Added availability result:', data);
      
      toast.success('Availability added successfully');
      fetchAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      toast.error('Failed to add availability');
    }
  };

  const deleteAvailability = async (id: string) => {
    try {
      console.log('Deleting availability:', id);
      
      const { error } = await supabase
        .from('guide_availability')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting availability:', error);
        throw error;
      }
      
      toast.success('Availability removed');
      setAvailabilities(availabilities.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Failed to remove availability');
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading your availability schedule...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Availability</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Day of Week</label>
            <Select 
              value={newAvailability.dayOfWeek.toString()} 
              onValueChange={(value) => setNewAvailability({...newAvailability, dayOfWeek: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <Select 
              value={newAvailability.startTime} 
              onValueChange={(value) => setNewAvailability({...newAvailability, startTime: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <Select 
              value={newAvailability.endTime} 
              onValueChange={(value) => setNewAvailability({...newAvailability, endTime: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          className="mt-4" 
          onClick={addAvailability}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Availability
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold p-6 pb-2">Your Availability Schedule</h3>
        
        {availabilities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            You haven't set any availability yet. Add your available time slots above.
          </div>
        ) : (
          <div className="p-6 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilities.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.dayName}</TableCell>
                    <TableCell>{item.startTime}</TableCell>
                    <TableCell>{item.endTime}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteAvailability(item.id)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideAvailability;
