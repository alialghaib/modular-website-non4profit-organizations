
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

interface HeroSectionProps {
  /** Main title displayed in the hero section */
  title: string;
  /** Subtitle or description text */
  subtitle: string;
  /** URL for the background image. Defaults to Moraine Lake */
  image?: string;
  /** Text for the call-to-action button */
  ctaText?: string;
  /** Link destination for the call-to-action button */
  ctaLink?: string;
}

/**
 * HeroSection component for displaying a full-width banner with background image.
 * Organizations can easily customize this by passing their own image, title, and text.
 */
const HeroSection = ({ 
  title, 
  subtitle, 
  image = "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb", // Beautiful Canadian mountains and river
  ctaText = "Explore Hikes", 
  ctaLink = "/hikes" 
}: HeroSectionProps) => {
  return (
    <div className="hero-container">
      {/* Background Image with Overlay */}
      <div 
        className="hero-background" 
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="hero-overlay"></div>
      </div>
      
      {/* Content */}
      <div className="hero-content">
        <div className="hero-content-inner">
          <h1 className="hero-title">
            {title}
          </h1>
          
          <p className="hero-subtitle">
            {subtitle}
          </p>
          
          <div className="hero-cta">
            <Link
              to={ctaLink}
              className="hero-button"
            >
              {ctaText}
              <ArrowRight className="hero-button-icon" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient at bottom */}
      <div className="hero-gradient-bottom"></div>
    </div>
  );
};

export default HeroSection;
