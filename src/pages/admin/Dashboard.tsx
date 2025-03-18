
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, Settings, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Nature Hikes</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Welcome back, {user?.firstName}! Manage your hiking operations here.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Manage Guides */}
                <Link to="/admin/guides" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Manage Guides</h3>
                    <p className="text-gray-600 dark:text-gray-400">Assign guides to hikes and manage staff details</p>
                  </div>
                </Link>
                
                {/* Schedule Management */}
                <Link to="/admin/schedule" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Schedule Management</h3>
                    <p className="text-gray-600 dark:text-gray-400">Create and edit hiking schedules</p>
                  </div>
                </Link>
                
                {/* Location Management */}
                <Link to="/admin/locations" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Locations</h3>
                    <p className="text-gray-600 dark:text-gray-400">Add and manage hiking locations</p>
                  </div>
                </Link>
                
                {/* Reports */}
                <Link to="/admin/reports" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reports</h3>
                    <p className="text-gray-600 dark:text-gray-400">View booking and financial reports</p>
                  </div>
                </Link>
                
                {/* Settings */}
                <Link to="/admin/settings" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400">Configure system preferences and settings</p>
                  </div>
                </Link>
              </div>
              
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            New booking received
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Mt. Stephen Fossil Beds Tour - 2 participants
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Just now
                        </div>
                      </div>
                    </li>
                    <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-sm">i</span>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Guide John assigned to Burgess Shale hike
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Automatic assignment based on availability
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          2 hours ago
                        </div>
                      </div>
                    </li>
                    <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="text-red-600 dark:text-red-400 text-sm">!</span>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Walcott Quarry hike at capacity
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            No more spots available for June 15
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          5 hours ago
                        </div>
                      </div>
                    </li>
                  </ul>
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

export default AdminDashboard;
