
import { useState } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuideCalendar, GuideSchedule } from "./Calendar";
import GuideAvailability from "@/components/GuideAvailability";
import GuideHikeAssignment from "@/components/GuideHikeAssignment";

const GuideDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <>
      <Helmet>
        <title>Guide Dashboard | Community Trail Guide</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Guide Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Welcome, {user?.firstName}! Manage your schedule and hiker groups.
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="calendar">Schedule</TabsTrigger>
                      <TabsTrigger value="upcoming">Upcoming Hikes</TabsTrigger>
                      <TabsTrigger value="past">Past Hikes</TabsTrigger>
                      <TabsTrigger value="availability">My Availability</TabsTrigger>
                      <TabsTrigger value="assignments">Hike Assignments</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6">
                    <TabsContent value="calendar">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                          <GuideCalendar onSelectDate={setSelectedDate} />
                        </div>
                        <div className="md:col-span-2">
                          <GuideSchedule selectedDate={selectedDate} />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upcoming">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Upcoming Hikes</h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                          {/* Demo upcoming hike */}
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                            <div className="md:flex">
                              <div className="md:w-1/3">
                                <img 
                                  src="https://images.unsplash.com/photo-1551632811-561732d1e306" 
                                  alt="Morning Trail Adventure" 
                                  className="h-48 md:h-full w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none" 
                                />
                              </div>
                              
                              <div className="p-6 md:w-2/3">
                                <div className="flex justify-between items-start">
                                  <h3 className="text-lg font-semibold">Morning Trail Adventure</h3>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400 text-xs font-medium rounded-full">
                                    Tomorrow, 8:00 AM
                                  </span>
                                </div>
                                
                                <div className="mt-2 flex flex-wrap gap-4">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Pine Forest Reserve
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    5 participants
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    3 hours
                                  </span>
                                </div>
                                
                                <div className="mt-4">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Waivers</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">4/5</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
                                  </div>
                                </div>
                                
                                <div className="mt-6 flex space-x-4">
                                  <button className="px-3 py-2 bg-primary hover:bg-primary/90 rounded text-sm font-medium text-white">
                                    View Details
                                  </button>
                                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Send Reminder
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="past">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Past Hikes</h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                          {/* Demo past hike */}
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                            <div className="md:flex">
                              <div className="md:w-1/3">
                                <img 
                                  src="https://images.unsplash.com/photo-1533240332313-0db49b459ad6" 
                                  alt="Mountain Summit Adventure" 
                                  className="h-48 md:h-full w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none opacity-80" 
                                />
                              </div>
                              
                              <div className="p-6 md:w-2/3">
                                <div className="flex justify-between items-start">
                                  <h3 className="text-lg font-semibold">Mountain Summit Adventure</h3>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                                    Last Week
                                  </span>
                                </div>
                                
                                <div className="mt-2 flex flex-wrap gap-4">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Rocky Mountain Trails
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    8 participants
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    5 hours
                                  </span>
                                </div>
                                
                                <div className="mt-4">
                                  <span className="inline-block bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                                    Completed
                                  </span>
                                </div>
                                
                                <div className="mt-6">
                                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300">
                                    View Trip Report
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="availability">
                      <GuideAvailability />
                    </TabsContent>
                    
                    <TabsContent value="assignments">
                      <GuideHikeAssignment />
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

export default GuideDashboard;
