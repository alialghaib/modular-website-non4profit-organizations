import { useState } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UserBookings from "@/components/UserBookings";
import HikeCard from "@/components/HikeCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// ✅ Define the correct Hike Type Interface
interface Hike {
  id: string;
  name: string;
  date: string;
  time: string;
  image: string;
}

const HikerDashboard = () => {
  const { user } = useAuth(); // ✅ Ensure `user` is available inside component
  const [activeTab, setActiveTab] = useState("hikes");
  const navigate = useNavigate();

  // ✅ Fixed: Use correct structure for fetching hikes
  const { data: upcomingHikes, isLoading } = useQuery<Hike[], Error>({
    queryKey: ["upcomingHikes", user?.id], 
    queryFn: async (): Promise<Hike[]> => { 
      if (!user) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString().split("T")[0];

      console.log("Fetching booked hikes for user:", user.id, "with date >= ", todayIso);

      const { data, error } = await supabase
        .from("bookings")
        .select("hikes: hike_id (id, name, date, time, image)") // ✅ Use proper aliasing
        .eq("user_id", user.id)
        .gte("hikes.date", todayIso)
        .order("hikes.date", { ascending: true });

      if (error) {
        console.error("Error fetching upcoming booked hikes:", error);
        throw error;
      }

      console.log("Raw Supabase response:", JSON.stringify(data, null, 2));

      // ✅ Ensure `hikes` exists and correctly flatten the array
      return (data?.flatMap((booking) => booking.hikes as Hike[]) ?? []);
    },
  });

  return (
    <>
      <Helmet>
        <title>Hiker Dashboard | Community Trail Guide</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome, {user?.firstName}!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    View your completed hikes and manage your profile information.
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <button 
                    onClick={() => navigate('/hikes')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Book a New Hike
                  </button>
                </div>
              </div>

              {/* Upcoming Hikes Section */}
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Adventures</h2>
                </div>
                
                <div className="p-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Loading upcoming hikes...</p>
                    </div>
                  ) : upcomingHikes && upcomingHikes.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-3">
                      {upcomingHikes.map((hike) => (
                        <HikeCard key={hike.id} hike={hike} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No upcoming hikes scheduled</p>
                      <Button onClick={() => navigate('/hikes')}>
                        Browse Available Hikes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default HikerDashboard;
