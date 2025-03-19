
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BookingSteps from '@/components/BookingSteps';
import { DEMO_HIKES } from '@/lib/demoData';
import { Hike } from '@/lib/types';
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';

const HikeDetail = () => {
  const { hikeId } = useParams<{ hikeId: string }>();
  const [hike, setHike] = useState<Hike | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchHike = async () => {
      setLoading(true);
      
      try {
        if (!hikeId) {
          throw new Error('Hike ID is required');
        }
        
        console.log('Fetching hike with ID:', hikeId);
        
        // First check if we have the hike in Supabase
        // Use limit(1) and maybeSingle() to ensure we only get one result
        const { data, error } = await supabase
          .from('hikes')
          .select('*')
          .eq('id', hikeId)
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.log('Supabase error, falling back to demo data:', error.message);
          // Fall back to demo data if not found in Supabase
          const demoHike = DEMO_HIKES.find(h => h.id === hikeId);
          
          if (demoHike) {
            console.log('Found demo hike:', demoHike.name);
            setHike(demoHike);
          } else {
            console.log('Hike not found in demo data either');
            setHike(null);
          }
        } else if (data) {
          console.log('Found hike in Supabase:', data.name);
          
          // Type check and convert difficulty to the expected union type
          let typedDifficulty: 'easy' | 'moderate' | 'hard' = 'moderate';
          
          if (data.difficulty === 'easy' || data.difficulty === 'moderate' || data.difficulty === 'hard') {
            typedDifficulty = data.difficulty as 'easy' | 'moderate' | 'hard';
          } else {
            console.log('Unknown difficulty level:', data.difficulty, 'defaulting to moderate');
          }
          
          // Map Supabase data to Hike type
          const supabaseHike: Hike = {
            id: data.id,
            name: data.name,
            date: data.date,
            time: data.time,
            image: data.image,
            description: data.description,
            difficulty: typedDifficulty,
            location: data.location,
            duration: data.duration,
            guide: data.guide,
            price: data.price,
            availableSpots: data.available_spots,
            bookedSpots: data.booked_spots,
            assignedGuideId: data.assigned_guide_id
          };
          
          setHike(supabaseHike);
        }
      } catch (error) {
        console.error('Error fetching hike:', error);
        toast.error('Failed to load hike details');
        
        // Fall back to demo data on error
        if (hikeId) {
          const demoHike = DEMO_HIKES.find(h => h.id === hikeId);
          if (demoHike) {
            setHike(demoHike);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchHike();
  }, [hikeId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400">Loading hike details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show "not found" message if hike doesn't exist
  if (!hike) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400">Hike not found.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{hike.name} | Community Trail Guide</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16 page-content">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <BookingSteps hike={hike} hikeId={hikeId} />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default HikeDetail;
