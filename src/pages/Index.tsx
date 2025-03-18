import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Mountain, Users } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

/**
 * Landing page component.
 * Organizations can easily customize this by:
 * 1. Modifying the HeroSection props
 * 2. Adding their own featured hikes
 * 3. Updating the mission statement and values
 * 4. Customizing the call-to-action section
 */
const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <HeroSection 
        title="Discover Canadian Trails Together"
        subtitle="Welcome to our community of outdoor enthusiasts. This template is designed for non-profit hiking organizations to easily customize and share their guided experiences."
        ctaText="View Our Hikes"
        ctaLink="/hikes"
      />
      
      {/* Featured Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Featured Hikes
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Replace this section with your organization's upcoming guided hikes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Demo cards - replace with your content */}
            {[1, 2, 3].map((_, index) => (
              <div 
                key={index}
                className={`transition-all duration-500 opacity-0 translate-y-4 ${
                  isLoaded ? 'opacity-100 translate-y-0' : ''
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <p className="text-gray-500 dark:text-gray-400">
                    Add your hiking events here
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Your Organization's Mission
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-12">
              This section is where you can share your organization's mission and values. Tell visitors about your commitment to the community and the environment.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6 mx-auto">
                  <Mountain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Trail Access
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Share your approach to making trails accessible to all.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 mx-auto">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Guided Hikes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Describe your guided hiking programs and what makes them special.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Community
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Highlight your community initiatives and volunteer opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Get Involved
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Customize this section to encourage visitors to join your community or support your cause.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/join-us"
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Join Us
              </Link>
              <Link
                to="/donate"
                className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Support Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
