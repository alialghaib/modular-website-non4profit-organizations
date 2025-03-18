
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Calendar, Map, CreditCard, FileText } from 'lucide-react';

const HikerDashboard = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock upcoming bookings for the hiker
  const upcomingBookings = [
    {
      id: '1',
      hikeName: 'Mt. Stephen Fossil Beds Tour',
      date: 'June 15, 2023',
      time: '9:00 AM',
      participants: 2,
      status: 'confirmed',
      eWaiverStatus: 'pending'
    }
  ];

  return (
    <>
      <Helmet>
        <title>My Dashboard | Nature Hikes</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Dashboard
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Welcome back, {user?.firstName}! Manage your hiking adventures.
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link
                    to="/hikes"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Browse Hikes
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Quick Link 1 */}
                <Link to="/hiker/bookings" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">My Bookings</h3>
                    <p className="text-gray-600 dark:text-gray-400">Manage your upcoming hikes</p>
                  </div>
                </Link>
                
                {/* Quick Link 2 */}
                <Link to="/hiker/waivers" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">E-Waivers</h3>
                    <p className="text-gray-600 dark:text-gray-400">View and sign required waivers</p>
                  </div>
                </Link>
                
                {/* Quick Link 3 */}
                <Link to="/hiker/payments" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Payment History</h3>
                    <p className="text-gray-600 dark:text-gray-400">View your payment records</p>
                  </div>
                </Link>
                
                {/* Quick Link 4 */}
                <Link to="/profile" className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                      <div className="h-6 w-6 flex items-center justify-center rounded-full bg-purple-600 dark:bg-purple-400 text-white font-medium text-sm">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">My Profile</h3>
                    <p className="text-gray-600 dark:text-gray-400">Update your personal details</p>
                  </div>
                </Link>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Bookings</h2>
                {upcomingBookings.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/30">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hike</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Participants</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-Waiver</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {upcomingBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.hikeName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{booking.date}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{booking.time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{booking.participants}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  {booking.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  {booking.eWaiverStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link to={`/hiker/booking/${booking.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">View Details</Link>
                                {booking.eWaiverStatus === 'pending' && (
                                  <Link to={`/hiker/booking/${booking.id}/waiver`} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Sign Waiver</Link>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any upcoming bookings.</p>
                    <Link
                      to="/hikes"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Browse Available Hikes
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recommended Hikes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                    <img src="/placeholder.svg" alt="Walcott Quarry" className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">Walcott Quarry</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Experience the famous fossil beds of the Burgess Shale</p>
                      <Link
                        to="/hikes/walcott-quarry"
                        className="text-sm font-medium text-primary hover:text-primary/80"
                      >
                        Learn more
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                    <img src="/placeholder.svg" alt="Stanley Glacier" className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">Stanley Glacier</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Beautiful glacier views and unique fossil discoveries</p>
                      <Link
                        to="/hikes/stanley-glacier"
                        className="text-sm font-medium text-primary hover:text-primary/80"
                      >
                        Learn more
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                    <img src="/placeholder.svg" alt="Mt. Stephen" className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">Mt. Stephen Fossil Beds</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Challenging hike with breathtaking trilobite fossils</p>
                      <Link
                        to="/hikes/mt-stephen"
                        className="text-sm font-medium text-primary hover:text-primary/80"
                      >
                        Learn more
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

export default HikerDashboard;
