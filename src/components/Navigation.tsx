
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NavItem } from '@/lib/types';
import { ChevronDown, Menu, X } from 'lucide-react';
import UserDropdown from './UserDropdown';
import AuthModal from "@/components/AuthModal";


const NAVIGATION_ITEMS: NavItem[] = [
  { title: 'Home', href: '/' },
  { 
    title: 'Hikes', 
    href: '/hikes',
  },
  { 
    title: 'About', 
    href: '/about',
    children: [
      { title: 'Foundation', href: '/about#foundation' },
      { title: 'Guides', href: '/about#guides' },
      { title: 'FAQs', href: '/about#faqs' },
    ]
  },
  { title: 'Donate', href: '/donate' },
  { title: 'Join Us', href: '/join-us', 
    children: [
      { title: 'Careers', href: '/join-us#careers' },
      { title: 'Volunteer', href: '/join-us#volunteer' },
    ]
  },
];

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Track scroll position for background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const toggleDropdown = (title: string) => {
    setOpenDropdown(prev => prev === title ? null : title);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-3' 
        : 'bg-transparent py-5'
      }`}
    >
    <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode={authMode} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3"
            aria-label="Home page"
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-nature-500 text-white">
              <span className="font-display font-bold">NH</span>
            </div>
            <span className="font-display text-lg font-medium hidden sm:block">Nature Hikes</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <ul className="flex space-x-6">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.title} className="relative group">
                  {item.children ? (
                    <div className="relative">
                      <button 
                        onClick={() => toggleDropdown(item.title)}
                        className={`nav-link flex items-center ${
                          location.pathname === item.href ? 'nav-link-active' : ''
                        }`}
                      >
                        {item.title}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                      
                      {openDropdown === item.title && (
                        <div className="absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 overflow-hidden z-20 animate-fade-in">
                          <div className="py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.title}
                                to={child.href}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                              >
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link 
                      to={item.href}
                      className={`nav-link ${
                        location.pathname === item.href ? 'nav-link-active' : ''
                      }`}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Auth/User Section */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>Login</button>
                <button onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}>Sign Up</button>

              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-4 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-slide-down">
            <ul className="flex flex-col space-y-2">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.title} className="w-full">
                  {item.children ? (
                    <div>
                      <button 
                        onClick={() => toggleDropdown(item.title)}
                        className="w-full flex justify-between items-center py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                      >
                        {item.title}
                        <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === item.title ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {openDropdown === item.title && (
                        <div className="pl-4 mt-1 space-y-1 animate-slide-down">
                          {item.children.map((child) => (
                            <Link
                              key={child.title}
                              to={child.href}
                              className="block py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link 
                      to={item.href}
                      className={`block py-2 text-base font-medium hover:text-gray-900 dark:hover:text-white ${
                        location.pathname === item.href ? 'text-primary' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {!isAuthenticated && (
              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-3">
                <Link 
                  to="/login" 
                  className="w-full py-2 text-center rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="w-full py-2 text-center rounded-md bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
