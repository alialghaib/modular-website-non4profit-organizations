
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const JoinUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Join Us | Nature Hikes</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Join Our Community
            </h1>
            
            <section id="careers" className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Careers
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-6">
                Join our team of dedicated professionals who are passionate about connecting people with nature and promoting environmental conservation.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Open Positions</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We don't have any open positions at the moment. Please check back later or sign up for our newsletter to be notified of future opportunities.
                </p>
              </div>
            </section>
            
            <section id="volunteer" className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Volunteer Opportunities
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-6">
                Volunteers are the backbone of our organization. We offer various volunteer opportunities from trail maintenance to event coordination.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Trail Maintenance Volunteer</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Help maintain and improve local hiking trails. Activities include clearing debris, repairing trail markers, and erosion control.
                </p>
                <button 
                  disabled
                  className="px-4 py-2 bg-primary/80 text-white font-medium rounded-md transition-colors cursor-not-allowed"
                >
                  Apply (Coming Soon)
                </button>
              </div>
            </section>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default JoinUs;
