
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BookingSteps from '@/components/BookingSteps';
import { DEMO_HIKES } from '@/lib/demoData';
import { Hike } from '@/lib/types';

const HikeDetail = () => {
  const { hikeId } = useParams<{ hikeId: string }>();
  const [hike, setHike] = useState<Hike | null>(null);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Find the hike with matching ID
    if (hikeId) {
      const foundHike = DEMO_HIKES.find(h => h.id === hikeId);
      if (foundHike) {
        setHike(foundHike);
      }
    }
  }, [hikeId]);

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
