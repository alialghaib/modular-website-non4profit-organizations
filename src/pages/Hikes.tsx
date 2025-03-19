import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HikeCard from "@/components/HikeCard";
import { DEMO_HIKES } from "@/lib/demoData";
import { Hike } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Hikes = () => {
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchHikes = async () => {
      setLoading(true);
      
      try {
        console.log('Fetching hikes from Supabase');
        
        // Try to fetch hikes from Supabase
        const { data, error } = await supabase
          .from('hikes')
          .select('*')
          .order('date', { ascending: true });
        
        if (error) {
          console.error('Error fetching hikes from Supabase:', error);
          toast.error('Failed to load hikes from database');
          // Fall back to demo data
          const uniqueDemoHikes = deduplicateHikes(DEMO_HIKES);
          setHikes(uniqueDemoHikes);
        } else if (data && data.length > 0) {
          console.log(`Found ${data.length} hikes in Supabase`);
          
          // Process and deduplicate hikes based on name
          const processedHikes = data.map(item => {
            // Type check and convert difficulty to the expected union type
            let typedDifficulty: 'easy' | 'moderate' | 'hard' = 'moderate';
            
            if (item.difficulty === 'easy' || item.difficulty === 'moderate' || item.difficulty === 'hard') {
              typedDifficulty = item.difficulty as 'easy' | 'moderate' | 'hard';
            } else {
              console.log('Unknown difficulty level:', item.difficulty, 'defaulting to moderate');
            }
            
            return {
              id: item.id,
              name: item.name,
              date: item.date,
              time: item.time,
              image: item.image,
              description: item.description,
              difficulty: typedDifficulty,
              location: item.location,
              duration: item.duration,
              guide: item.guide,
              price: item.price,
              availableSpots: item.available_spots,
              bookedSpots: item.booked_spots,
              assignedGuideId: item.assigned_guide_id
            };
          });
          
          // Deduplicate hikes based on name
          const uniqueHikes = deduplicateHikes(processedHikes);
          console.log(`Filtered to ${uniqueHikes.length} unique hikes by name`);
          setHikes(uniqueHikes);
        } else {
          // No hikes found in Supabase, use demo data
          console.log('No hikes found in database, using demo data');
          
          // Ensure demo data has no duplicates based on name
          const uniqueDemoHikes = deduplicateHikes(DEMO_HIKES);
          setHikes(uniqueDemoHikes);
          toast.info('Using demo hike data for preview');
        }
      } catch (error) {
        console.error('Error fetching hikes:', error);
        toast.error('Failed to load hikes');
        // Fall back to demo data with no duplicates
        const uniqueDemoHikes = deduplicateHikes(DEMO_HIKES);
        setHikes(uniqueDemoHikes);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHikes();
  }, []);

  // Function to deduplicate hikes based on name
  const deduplicateHikes = (hikesArray: Hike[]): Hike[] => {
    const uniqueHikesMap = new Map<string, Hike>();
    
    // Keep only the first occurrence of each hike name
    hikesArray.forEach(hike => {
      if (!uniqueHikesMap.has(hike.name)) {
        uniqueHikesMap.set(hike.name, hike);
      }
    });
    
    return Array.from(uniqueHikesMap.values());
  };

  // Debug log to check for duplicates
  useEffect(() => {
    if (hikes.length > 0) {
      const hikeNames = hikes.map(h => h.name);
      const uniqueNames = new Set(hikeNames);
      console.log(`Hikes array has ${hikes.length} items with ${uniqueNames.size} unique names`);
      
      // Log each unique hike to verify
      console.log('Unique hikes by name:', Array.from(uniqueNames).map(name => {
        const hike = hikes.find(h => h.name === name);
        return { id: hike?.id, name };
      }));
    }
  }, [hikes]);

  return (
    <>
      <Helmet>
        <title>Our Hikes | Community Trail Guide</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16 page-content">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-6">
              Our Guided Hikes
            </h1>
            <p className="text-lg max-w-3xl mb-8">
              Join us on our guided hiking experiences. Book a hike below to secure your spot and prepare for an unforgettable adventure.
            </p>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <p className="text-lg text-gray-600 dark:text-gray-400">Loading hikes...</p>
              </div>
            ) : hikes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hikes.map(hike => (
                  <div key={hike.id} className="block">
                    <Link to={`/hike/${hike.id}`}>
                      <HikeCard hike={hike} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600 dark:text-gray-400">No hikes available at the moment.</p>
              </div>
            )}
            
            <div className="mt-10 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Supabase Integration</h3>
              <p className="text-blue-700 dark:text-blue-300">
                This page now fetches hike data from Supabase with a fallback to demo data if the connection fails or no data is found.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Hikes;
