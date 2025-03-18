
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Donate = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Donate | Nature Hikes</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Support Our Mission
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-8">
              Your donations help us maintain trails, train guides, provide scholarships for underprivileged hikers, and protect natural landscapes.
            </p>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Donation Form
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Donation functionality coming soon. Thank you for your interest in supporting Nature Hikes!
              </p>
              <div className="flex justify-center">
                <button 
                  disabled
                  className="px-6 py-3 bg-primary/80 text-white font-medium rounded-full transition-colors cursor-not-allowed"
                >
                  Donate Now (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Donate;
