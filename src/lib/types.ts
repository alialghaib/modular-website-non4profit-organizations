
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: 'admin' | 'guide' | 'hiker';
  stripeCustomerId?: string;
}

export interface Hike {
  id: string;
  name: string;
  date: string;
  time: string;
  image: string;
  description?: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
  location?: string;
  duration?: string;
  guide?: string;
  price?: number;
  availableSpots?: number;
  bookedSpots?: number;
  assignedGuideId?: string;
}

export interface Booking {
  id: string;
  hikeId: string;
  userId: string;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  participants: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  eWaiverSigned: boolean;
  eWaiverUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: string;
  color?: string;
}

export interface NavItem {
  title: string;
  href: string;
  children?: {
    title: string;
    href: string;
  }[];
}
