
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Helmet>
        <title>My Profile | Nature Hikes</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                My Profile
              </h1>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                      <span className="text-xl font-bold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">@{user?.username}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Email</span>
                        <span className="text-gray-900 dark:text-white">{user?.email}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Phone</span>
                        <span className="text-gray-900 dark:text-white">{user?.phone || "None provided"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Verification Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Email Verification</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user?.isEmailVerified 
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                        }`}>
                          {user?.isEmailVerified ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Phone Verification</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user?.isPhoneVerified 
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                        }`}>
                          {user?.isPhoneVerified ? "Verified" : "Not Verified"}
                        </span>
                      </div>
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

export default Profile;
