
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, CheckSquare } from 'lucide-react';

const GuideDashboard = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock scheduled hikes for the guide
  const upcomingHikes = [
    {
      id: '1',
      name: 'Mt. Stephen Fossil Beds Tour',
      date: 'June 15, 2023',
      time: '9:00 AM',
      participants: 8,
      location: 'Yoho National Park'
    },
    {
      id: '2',
      name: 'Walcott Quarry',
      date: 'June 18, 2023',
      time: '8:30 AM',
      participants: 6,
      location: 'Yoho National Park'
    },
    {
      id: '3',
      name: 'Burgess Shale Guided Hike',
      date: 'June 22, 2023',
      time: '9:00 AM',
      participants: 10,
      location: 'Yoho National Park'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Guide Dashboard | Nature Hikes</title>
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
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Welcome back, {user?.firstName}! Manage your upcoming hikes here.
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link
                    to="/guide/calendar"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stats Card 1 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Hikes</h3>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">3</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Card 2 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                        <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Participants</h3>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">24</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Card 3 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3">
                        <CheckSquare className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">E-Waivers Pending</h3>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">5</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Assigned Hikes</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/30">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hike</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Participants</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {upcomingHikes.map((hike) => (
                          <tr key={hike.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{hike.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{hike.date}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{hike.time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{hike.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{hike.participants}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link to={`/guide/hike/${hike.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">View Details</Link>
                              <Link to={`/guide/hike/${hike.id}/waivers`} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Waivers</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Messages</h2>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="inline-block h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-semibold">A</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Admin Team
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Your schedule for next week has been updated. Please review the changes.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                      </li>
                      <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="inline-block h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-semibold">S</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              System Notification
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Weather alert for tomorrow's hike: Chance of afternoon thunderstorms.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Yesterday
                            </p>
                          </div>
                        </div>
                      </li>
                    </ul>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <Link to="/guide/messages" className="text-sm font-medium text-primary hover:text-primary/80">
                        View all messages
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Important Documents</h2>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <Link to="#" className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900 dark:text-white">Guide Safety Manual</div>
                        </Link>
                      </li>
                      <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <Link to="#" className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900 dark:text-white">Trail Maps</div>
                        </Link>
                      </li>
                      <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <Link to="#" className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900 dark:text-white">First Aid Procedures</div>
                        </Link>
                      </li>
                      <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <Link to="#" className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900 dark:text-white">Wildlife Encounter Protocol</div>
                        </Link>
                      </li>
                    </ul>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <Link to="/guide/documents" className="text-sm font-medium text-primary hover:text-primary/80">
                        View all documents
                      </Link>
                    </div>
                  </div>
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

export default GuideDashboard;
