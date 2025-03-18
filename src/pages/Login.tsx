
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      // Show modal after a short delay for animation
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Log in to access your hiking profile and upcoming adventures
              </p>
            </div>
            
            <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                setShowModal(true);
              }}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <button 
                      type="button"
                      className="font-medium text-primary hover:text-primary/80"
                      onClick={() => toast.info('Password reset feature coming soon!')}
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Log in
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="font-medium text-primary hover:text-primary/80"
                    >
                      Sign up now
                    </Link>
                  </p>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Test Accounts:</strong><br />
                    Admin: admin@example.com / password<br />
                    Guide: guide@example.com / password<br />
                    Hiker: hiker@example.com / password
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Login Modal */}
      <AuthModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        mode="login" 
      />
    </div>
  );
};

export default Login;
