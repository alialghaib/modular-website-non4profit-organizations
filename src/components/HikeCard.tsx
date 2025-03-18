
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hike } from '@/lib/types';

interface HikeCardProps {
  hike: Hike;
  variant?: 'default' | 'compact';
}

const HikeCard = ({ hike, variant = 'default' }: HikeCardProps) => {
  const { id, name, date, time, image, difficulty, location, duration } = hike;
  
  // Function to determine badge color based on difficulty
  const getDifficultyColor = (difficulty?: string) => {
    switch(difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };
  
  if (variant === 'compact') {
    return (
      <div className="group relative rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 flex">
        <div 
          className="w-24 h-24 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
        <div className="p-4 flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{date}</span>
            <Clock className="h-4 w-4 ml-3 mr-1 flex-shrink-0" />
            <span>{time}</span>
          </div>
          {difficulty && (
            <span className={`mt-2 inline-block px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="group h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {difficulty && (
          <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="mt-3 space-y-2 flex-1">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            {date}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
            {time}
          </div>
          
          {location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
              {location}
            </div>
          )}
          
          {duration && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Duration:</span> {duration}
            </div>
          )}
        </div>
        
        <Link 
          to={`/hikes/${id}`}
          className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View Details
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default HikeCard;
