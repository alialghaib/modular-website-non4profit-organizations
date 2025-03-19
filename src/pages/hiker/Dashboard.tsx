
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

const HikerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("hikes");
  const navigate = useNavigate();

  // Fetch upcoming hikes
  const { data: upcomingHikes, isLoading } = useQuery({
    queryKey: ["upcomingHikes"],
    queryFn: async () => {
      // Get today's date at the beginning of the day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString().split('T')[0];
      
      console.log('Fetching upcoming hikes with date >= ' + todayIso);
      
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .gte('date', todayIso) // Use greater than or equal to include today's hikes
        .order('date', { ascending: true })
        .limit(3);
      
      if (error) {
        console.error('Error fetching upcoming hikes:', error);
        throw error;
      }
      
      console.log('Fetched upcoming hikes:', data);
      return data || [];
    }
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
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="hikes">Completed Hikes</TabsTrigger>
                      <TabsTrigger value="waivers">E-Waivers</TabsTrigger>
                      <TabsTrigger value="payments">Payments</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6">
                    <TabsContent value="hikes">
                      <UserBookings />
                    </TabsContent>
                    
                    <TabsContent value="waivers">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">E-Waivers</h2>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-blue-800 dark:text-blue-300">
                            All participants must complete an e-waiver before participating in a hike. 
                            You can upload your signed waiver when booking a new hike.
                          </p>
                        </div>
                        
                        <div className="text-center py-10">
                          <p className="text-gray-500 dark:text-gray-400">No active waivers found.</p>
                          <button 
                            onClick={() => navigate('/hikes')}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
                          >
                            Book a New Hike
                          </button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="payments">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Payment History</h2>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Hike
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Receipt
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {/* Demo payment history */}
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {new Date().toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  Morning Trail Hike
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  $75.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                                    Paid
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  <a href="#" className="text-primary hover:underline">View</a>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(Date.now() - 7 * 86400000).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  Mountain Summit Adventure
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  $125.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                                    Paid
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  <a href="#" className="text-primary hover:underline">View</a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Demo Mode</h3>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            This payment history is simulated. In a production environment, actual payment records from Stripe would be displayed.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
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
