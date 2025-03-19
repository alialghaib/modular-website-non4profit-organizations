
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
  maxParticipantsPerTimeSlot?: number;
}

export interface Booking {
  id: string;
  hikeId: string;
  userId: string;
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  participants: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  eWaiverSigned: boolean;
  eWaiverUrl?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  reference?: string;
  createdAt: string;
  hike?: {
    name: string;
    image: string;
    difficulty: string;
  };
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

export interface PaymentDetails {
  id: string;
  status: 'succeeded' | 'processing' | 'failed';
  amount: number;
  created: string;
  receiptUrl?: string;
}

export interface EWaiver {
  id: string;
  userId: string;
  bookingId: string;
  hikeId: string;
  fileUrl: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface HikerParticipant {
  id: string;
  userId: string;
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  eWaiverSigned: boolean;
  eWaiverUrl?: string;
}
