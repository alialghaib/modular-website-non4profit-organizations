
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-nature-500 text-white">
                <span className="font-display font-bold">NH</span>
              </div>
              <span className="font-display text-lg font-medium">Nature Hikes</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Connecting people with nature through sustainable hiking experiences that promote conservation and community.
            </p>
            <div className="flex space-x-4 mt-6">
              <a 
                href="#" 
                aria-label="Facebook" 
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                aria-label="Instagram" 
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                aria-label="Twitter" 
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/hikes" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  Upcoming Hikes
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/join-us" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  Join Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about#foundation" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  Our Foundation
                </Link>
              </li>
              <li>
                <Link to="/about#guides" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  Our Guides
                </Link>
              </li>
              <li>
                <Link to="/about#faqs" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/join-us#careers" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/join-us#volunteer" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm">
                  Volunteer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  123 Nature Way, Mountain View, CA 94043
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  (555) 123-4567
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  info@naturehikes.org
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Nature Hikes. All rights reserved. | 
            <a href="#" className="hover:text-primary ml-1">Privacy Policy</a> |
            <a href="#" className="hover:text-primary ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
