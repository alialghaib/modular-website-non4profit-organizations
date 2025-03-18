
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Settings, Calendar, FileText, CreditCard } from 'lucide-react';

const UserDropdown = () => {
  const { user, logout, checkRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (checkRole(['admin'])) {
      return '/admin/dashboard';
    } else if (checkRole(['guide'])) {
      return '/guide/dashboard';
    } else {
      return '/hiker/dashboard';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300 transition-colors">
          <User className="h-5 w-5" />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 origin-top-right animate-fade-in">
          <div className="py-1 rounded-md bg-white dark:bg-gray-800 shadow-xs">
            <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'admin' 
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400" 
                    : user?.role === 'guide'
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                    : "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                }`}>
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'guide' ? 'Guide' : 'Hiker'}
                </span>
              </div>
            </div>
            
            <Link
              to={getDashboardLink()}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="h-4 w-4 mr-3" />
              Dashboard
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4 mr-3" />
              Profile
            </Link>
            
            {checkRole(['hiker']) && (
              <>
                <Link
                  to="/hiker/bookings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  My Bookings
                </Link>
                
                <Link
                  to="/hiker/waivers"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FileText className="h-4 w-4 mr-3" />
                  E-Waivers
                </Link>
                
                <Link
                  to="/hiker/payments"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payment History
                </Link>
              </>
            )}
            
            {checkRole(['guide']) && (
              <>
                <Link
                  to="/guide/calendar"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  My Schedule
                </Link>
                
                <Link
                  to="/guide/documents"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Documents
                </Link>
              </>
            )}
            
            {checkRole(['admin']) && (
              <>
                <Link
                  to="/admin/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  System Settings
                </Link>
              </>
            )}
            
            <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
