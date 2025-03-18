
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>About Us | Community Trail Guide</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16 page-content">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-6">
              About Our Organization
            </h1>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Our Story
              </h2>
              <p className="text-lg max-w-3xl mb-4">
                This is where you can share your organization's history and mission. When did you start? What inspired the creation of your hiking group?
              </p>
              <p className="text-lg max-w-3xl">
                Share how your organization contributes to the community and promotes environmental stewardship through hiking and outdoor activities.
              </p>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Our Guides
              </h2>
              <p className="text-lg max-w-3xl">
                Introduce your team of guides here. Share their qualifications, experience, and passion for the outdoors. This helps build trust with potential participants.
              </p>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Common Questions
              </h2>
              <div className="space-y-4 max-w-3xl">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium">What should I bring on a hike?</h3>
                  <p className="mt-2">
                    Customize this section with your recommended gear list and preparations for participants.
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium">How do I join a guided hike?</h3>
                  <p className="mt-2">
                    Explain your registration process and any requirements for participation.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;
