import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DEMO_HIKES, DEMO_BOOKINGS } from '@/lib/demoData';
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const AdminHikeSeeder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [seedResults, setSeedResults] = useState<{success: number, failed: number}>({ success: 0, failed: 0 });
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('hikes');
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingResults, setBookingResults] = useState<{success: number, failed: number}>({ success: 0, failed: 0 });
  const [guideEmail, setGuideEmail] = useState('guide@example.com');
  const { user } = useAuth();

  const seedHikes = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admin users can seed the database');
      return;
    }

    setIsLoading(true);
    setSeedResults({ success: 0, failed: 0 });
    setErrorDetails(null);
    
    try {
      // First check if we have an active session with fresh token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Session error:', sessionError);
        throw new Error('No active session found. Please log in again.');
      }
      
      console.log('Active session detected, proceeding with seeding as user:', user.email);
      console.log('Session user id:', sessionData.session.user.id);
      console.log('Session JWT role claims:', sessionData.session.user.app_metadata);
      console.log('Session user metadata:', sessionData.session.user.user_metadata);
      
      // Force a refresh of the token to ensure updated claims
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Failed to refresh token:', refreshError);
      } else {
        console.log('Successfully refreshed auth token');
      }
      
      // Explicitly update admin role in user_metadata for the DB function to detect
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (updateError) {
        console.error('Failed to update user metadata:', updateError);
      } else {
        console.log('Successfully updated user metadata with admin role');
        
        // Force another refresh to ensure the updated metadata is in the token
        await supabase.auth.refreshSession();
        console.log('Refreshed token again after metadata update');
      }
      
      // Get the current user's role from the profiles table as a double-check
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      
      console.log('Profile data from database:', profileData);
      
      if (!profileData) {
        console.log('Profile not found, creating it now...');
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.username || user.email.split('@')[0],
            email: user.email,
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            role: 'admin'
          })
          .select();
        
        if (createError) {
          console.error('Failed to create profile:', createError);
        } else {
          console.log('Created user profile:', newProfile);
        }
      }
      
      // Get JWT role for debugging - use type assertion to bypass TypeScript error
      const { data: jwtRole, error: jwtError } = await supabase.rpc(
        'get_jwt_role' as any
      );
      
      console.log('Current JWT role from database function:', jwtRole);
      if (jwtError) {
        console.error('Error getting JWT role:', jwtError);
      }
      
      // Fetch guide id based on email to assign hikes
      let guideId = null;
      if (guideEmail) {
        const { data: guideData, error: guideError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', guideEmail)
          .maybeSingle();
          
        if (guideError) {
          console.error('Error finding guide:', guideError);
        } else if (guideData) {
          console.log('Found guide:', guideData);
          guideId = guideData.id;
        } else {
          console.log('Guide not found with email:', guideEmail);
        }
      }
      
      const successCount = { success: 0, failed: 0 };
      let lastError = '';
      
      // Process each demo hike
      for (const hike of DEMO_HIKES) {
        try {
          // Set assigned guide ID if guide was found, otherwise leave as null
          const hikeData = {
            name: hike.name,
            date: hike.date,
            time: hike.time,
            image: hike.image,
            description: hike.description,
            difficulty: hike.difficulty,
            location: hike.location,
            duration: hike.duration,
            guide: hike.guide,
            price: hike.price,
            available_spots: hike.availableSpots,
            booked_spots: hike.bookedSpots,
            assigned_guide_id: guideId  // Use guide ID if found, otherwise null
          };
          
          console.log(`Attempting to insert hike: ${hike.name} with guide: ${guideId || 'none'}`);
          
          // Insert with RPC call to bypass RLS
          const { error } = await supabase.rpc('admin_insert_hike', {
            hike_data: hikeData
          });
          
          if (error) {
            console.error(`Failed to insert hike ${hike.name}:`, error);
            lastError = `${error.code}: ${error.message}`;
            successCount.failed++;
          } else {
            console.log(`Successfully inserted hike: ${hike.name}`);
            successCount.success++;
          }
        } catch (error: any) {
          console.error(`Error processing hike ${hike.name}:`, error);
          lastError = error?.message || 'Unknown error';
          successCount.failed++;
        }
      }
      
      setSeedResults(successCount);
      
      if (successCount.success > 0) {
        toast.success(`Successfully added ${successCount.success} hikes to the database`);
      }
      
      if (successCount.failed > 0) {
        setErrorDetails(lastError);
        toast.error(`Failed to add ${successCount.failed} hikes`);
      }
    } catch (error: any) {
      console.error('Error seeding hikes:', error);
      setErrorDetails(error?.message || 'Unknown error');
      toast.error('Failed to seed hikes');
    } finally {
      setIsLoading(false);
    }
  };

  const seedBookings = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admin users can seed the database');
      return;
    }

    setIsLoadingBookings(true);
    setBookingResults({ success: 0, failed: 0 });
    setErrorDetails(null);

    try {
      // Get all hikes to match bookings to
      const { data: hikesData, error: hikesError } = await supabase
        .from('hikes')
        .select('*');

      if (hikesError) {
        throw new Error(`Failed to fetch hikes: ${hikesError.message}`);
      }

      if (!hikesData || hikesData.length === 0) {
        throw new Error('No hikes found. Please seed hikes first.');
      }

      console.log('Found hikes:', hikesData);

      // Create lookup map by date
      const hikesByDate: Record<string, any[]> = {};
      hikesData.forEach(hike => {
        if (!hikesByDate[hike.date]) {
          hikesByDate[hike.date] = [];
        }
        hikesByDate[hike.date].push(hike);
      });

      console.log('Hikes by date:', hikesByDate);

      const successCount = { success: 0, failed: 0 };
      let lastError = '';

      // Process each demo booking
      for (const booking of DEMO_BOOKINGS) {
        try {
          // Find matching hike by date and reference id
          const matchingHikes = hikesByDate[booking.bookingDate] || [];
          const matchingHike = matchingHikes.find(h => {
            // Match by demo id if possible
            if (booking.hikeId && h.id === booking.hikeId) return true;
            // Otherwise match by time
            return h.time === booking.bookingTime;
          });

          if (!matchingHike) {
            console.error(`No matching hike found for booking on ${booking.bookingDate} at ${booking.bookingTime}`);
            successCount.failed++;
            continue;
          }

          console.log(`Found matching hike for booking: ${matchingHike.name} (${matchingHike.id})`);

          const bookingData = {
            hike_id: matchingHike.id,
            customer_name: booking.customerName,
            customer_email: booking.customerEmail,
            customer_phone: booking.customerPhone,
            participants: booking.participants,
            status: booking.status,
            payment_status: booking.paymentStatus,
            booking_date: booking.bookingDate,
            booking_time: booking.bookingTime,
            e_waiver_signed: booking.eWaiverSigned,
            e_waiver_url: booking.eWaiverUrl,
            emergency_contact_name: booking.emergencyContactName,
            emergency_contact_phone: booking.emergencyContactPhone,
            reference: `DEMO-${Math.floor(Math.random() * 10000)}`
          };

          console.log(`Attempting to insert booking for ${booking.customerName}`);

          // Insert booking
          const { error } = await supabase
            .from('bookings')
            .insert(bookingData);

          if (error) {
            console.error(`Failed to insert booking for ${booking.customerName}:`, error);
            lastError = `${error.code}: ${error.message}`;
            successCount.failed++;
          } else {
            console.log(`Successfully inserted booking for: ${booking.customerName}`);
            successCount.success++;
          }
        } catch (error: any) {
          console.error(`Error processing booking:`, error);
          lastError = error?.message || 'Unknown error';
          successCount.failed++;
        }
      }

      setBookingResults(successCount);

      if (successCount.success > 0) {
        toast.success(`Successfully added ${successCount.success} bookings to the database`);
      }

      if (successCount.failed > 0) {
        setErrorDetails(lastError);
        toast.error(`Failed to add ${successCount.failed} bookings`);
      }
    } catch (error: any) {
      console.error('Error seeding bookings:', error);
      setErrorDetails(error?.message || 'Unknown error');
      toast.error('Failed to seed bookings');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Seed Database with Test Data</h3>
      
      <Tabs defaultValue="hikes" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="hikes">Hikes</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hikes">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Click the button below to add {DEMO_HIKES.length} demo hikes to your Supabase database.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guideEmail">Guide Email to Assign Hikes To:</Label>
                <Input 
                  id="guideEmail" 
                  value={guideEmail} 
                  onChange={(e) => setGuideEmail(e.target.value)}
                  placeholder="Enter guide email"
                />
                <p className="text-xs text-gray-500">
                  Hikes will be assigned to this guide if the email exists in the database.
                  Default: guide@example.com
                </p>
              </div>
              
              <Button 
                onClick={seedHikes} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Hikes...
                  </>
                ) : (
                  'Add Demo Hikes to Database'
                )}
              </Button>
            </div>
            
            {(seedResults.success > 0 || seedResults.failed > 0) && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <h4 className="font-medium mb-2">Results:</h4>
                <p className="text-sm">
                  <span className="text-green-600 dark:text-green-400">{seedResults.success} hikes added successfully</span>
                  {seedResults.failed > 0 && (
                    <span className="text-red-600 dark:text-red-400 ml-3">{seedResults.failed} hikes failed</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="bookings">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Click the button below to add {DEMO_BOOKINGS.length} demo bookings to your Supabase database. Bookings will be matched to existing hikes.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={seedBookings} 
                disabled={isLoadingBookings}
              >
                {isLoadingBookings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Bookings...
                  </>
                ) : (
                  'Add Demo Bookings to Database'
                )}
              </Button>
            </div>
            
            {(bookingResults.success > 0 || bookingResults.failed > 0) && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <h4 className="font-medium mb-2">Results:</h4>
                <p className="text-sm">
                  <span className="text-green-600 dark:text-green-400">{bookingResults.success} bookings added successfully</span>
                  {bookingResults.failed > 0 && (
                    <span className="text-red-600 dark:text-red-400 ml-3">{bookingResults.failed} bookings failed</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {errorDetails && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="text-sm font-mono break-words">
            {errorDetails}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminHikeSeeder;
