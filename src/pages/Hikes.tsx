
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HikeCard from "@/components/HikeCard";
import { DEMO_HIKES } from "@/lib/demoData";

const Hikes = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_HIKES.map(hike => (
                <Link to={`/hike/${hike.id}`} key={hike.id} className="block">
                  <HikeCard hike={hike} />
                </Link>
              ))}
            </div>
            
            <div className="mt-10 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Information</h3>
              <p className="text-blue-700 dark:text-blue-300">
                This is a demo hikes page. Click on any hike to view details and test the booking flow with Cal.com and Stripe integration.
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
