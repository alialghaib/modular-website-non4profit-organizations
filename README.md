
# Nature Hikes - Non-Profit Hiking Organization

This project is a modular landing page and dashboard for non-profit hiking organizations. It's designed to be easily customizable so other hiking non-profits can adapt it for their own use.

## Project Overview

Nature Hikes is a web application that allows hiking organizations to showcase their guided hikes, mission, and community engagement. The application includes authentication, a landing page with various sections, navigation, and UI components designed for a great user experience.

## Tech Stack

- **React + TypeScript**: Core frontend framework
- **Vite**: Build tool and development server
- **React Router**: Page routing and navigation
- **TanStack Query**: Data fetching and state management
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Lucide React**: Icon library

## Project Structure

### Core Application Files

- `src/App.tsx`: Main application component with routing configuration and providers
- `src/main.tsx`: Application entry point
- `src/index.css`: Global CSS styles including Tailwind imports
- `src/lib/types.ts`: TypeScript interface definitions for the application
- `src/lib/utils.ts`: Utility functions used throughout the application

### Pages

- `src/pages/Index.tsx`: Landing page with multiple sections (hero, featured hikes, mission statement, call to action)
- `src/pages/NotFound.tsx`: 404 error page
- `src/pages/Login.tsx`: User login page
- `src/pages/SignUp.tsx`: User registration page

### Components

#### Main Components

- `src/components/HeroSection.tsx`: Hero banner with background image, title, subtitle and call-to-action
- `src/components/Navigation.tsx`: Main navigation bar with responsive mobile menu
- `src/components/Footer.tsx`: Page footer with links and information
- `src/components/HikeCard.tsx`: Card component for displaying hike information
- `src/components/UserDropdown.tsx`: User dropdown menu for authenticated users
- `src/components/AuthModal.tsx`: Authentication modal component

#### UI Components

The `src/components/ui/` directory contains reusable UI components, many from shadcn/ui:

- `toast.tsx` & `toaster.tsx`: Toast notification components
- `tooltip.tsx`: Tooltip component for hover information
- `sonner.tsx`: Additional toast notification component

### Context

- `src/context/AuthContext.tsx`: Authentication context provider with login/signup/logout functionality

### Hooks

- `src/hooks/use-toast.ts`: Hook for managing toast notifications
- `src/hooks/use-mobile.tsx`: Hook for detecting mobile devices

## Key Features

1. **Authentication System**: Mock authentication with user registration and login functionality
2. **Responsive Design**: Mobile-first design that works well on all screen sizes
3. **Modular Components**: Reusable components that can be customized and rearranged
4. **Interactive UI**: Animations, tooltips, and toast notifications for better user experience
5. **Featured Hikes**: Showcase upcoming hiking events with details
6. **Mission Statement**: Section to highlight the organization's mission and values
7. **User Management**: User dropdown with profile and logout options

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. The application will be available at `http://localhost:8080`

## Customization Guide

This project is designed to be modular and customizable for other non-profit hiking organizations:

1. **Branding**: Update the logo, colors, and text in the navigation and footer
2. **Content**: Modify the hike data in `src/pages/Index.tsx` to showcase your organization's hikes
3. **Images**: Replace background images in the hero section and elsewhere
4. **Mission**: Update the mission statement to reflect your organization's values
5. **Navigation**: Customize the navigation links to match your site structure

## Future Development

This project serves as a foundation for a more comprehensive hiking organization platform. Future enhancements might include:

- Hike booking and registration system
- Member profiles and community features
- Donation and fundraising integration
- Environmental conservation tracking
- Volunteer management system
