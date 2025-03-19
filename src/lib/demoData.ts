
import { Hike } from './types';

// Demo hikes data for testing
export const DEMO_HIKES: Hike[] = [
  {
    id: "1",
    name: "Banff Sulphur Mountain Trail",
    date: "2024-06-15",
    time: "8:00 AM",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86",
    difficulty: "moderate",
    location: "Banff National Park, AB",
    duration: "3-4 hours",
    price: 75,
    availableSpots: 10,
    bookedSpots: 4,
    description: "Scenic mountain hike with gondola access and stunning valley views.",
    guide: "Mountain Expert",
    assignedGuideId: null // Changed from "current" to null
  },
  {
    id: "2",
    name: "Bruce Trail Experience",
    date: "2024-06-22",
    time: "9:00 AM",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    difficulty: "easy",
    location: "Niagara Region, ON",
    duration: "2-3 hours",
    price: 45,
    availableSpots: 15,
    bookedSpots: 2,
    description: "Beautiful trail along the Niagara Escarpment with waterfall views.",
    guide: "Forest Guide",
    assignedGuideId: null // Changed from "current" to null
  },
  {
    id: "3",
    name: "Garibaldi Lake Trek",
    date: "2024-07-05",
    time: "7:00 AM",
    image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716",
    difficulty: "hard",
    location: "Garibaldi Provincial Park, BC",
    duration: "6-7 hours",
    price: 95,
    availableSpots: 8,
    bookedSpots: 6,
    description: "Alpine lake hike with stunning mountain and glacier views.",
    guide: "Alpine Specialist",
    assignedGuideId: null // Changed from "current" to null
  },
  {
    id: "4",
    name: "Today's Trail Adventure",
    date: new Date().toISOString().split('T')[0], // Today's date
    time: "10:00 AM",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306",
    difficulty: "moderate",
    location: "Local Mountains",
    duration: "4-5 hours",
    price: 65,
    availableSpots: 12,
    bookedSpots: 3,
    description: "Explore the wilderness on this exciting day hike scheduled for today.",
    guide: "Day Guide",
    assignedGuideId: null // Changed from "current" to null
  }
];

// Demo bookings data for testing
export const DEMO_BOOKINGS = [
  {
    hikeId: "1", // Will be replaced with actual hike ID
    customerName: "John Smith",
    customerEmail: "john@example.com",
    customerPhone: "555-123-4567",
    participants: 2,
    status: "confirmed",
    paymentStatus: "paid",
    bookingDate: "2024-06-15",
    bookingTime: "8:00 AM",
    eWaiverSigned: true,
    eWaiverUrl: "https://example.com/waiver/john-smith",
    emergencyContactName: "Jane Smith",
    emergencyContactPhone: "555-987-6543"
  },
  {
    hikeId: "1", // Will be replaced with actual hike ID
    customerName: "Emma Johnson",
    customerEmail: "emma@example.com",
    customerPhone: "555-234-5678",
    participants: 1,
    status: "confirmed",
    paymentStatus: "paid",
    bookingDate: "2024-06-15",
    bookingTime: "8:00 AM",
    eWaiverSigned: false,
    emergencyContactName: "Michael Johnson",
    emergencyContactPhone: "555-876-5432"
  },
  {
    hikeId: "4", // Will be replaced with today's hike ID
    customerName: "Alex Wilson",
    customerEmail: "alex@example.com",
    customerPhone: "555-345-6789",
    participants: 3,
    status: "confirmed",
    paymentStatus: "paid",
    bookingDate: new Date().toISOString().split('T')[0], // Today's date
    bookingTime: "10:00 AM",
    eWaiverSigned: true,
    eWaiverUrl: "https://example.com/waiver/alex-wilson",
    emergencyContactName: "Taylor Wilson",
    emergencyContactPhone: "555-765-4321"
  },
  {
    hikeId: "4", // Will be replaced with today's hike ID
    customerName: "Sam Brown",
    customerEmail: "sam@example.com",
    customerPhone: "555-456-7890",
    participants: 2,
    status: "confirmed",
    paymentStatus: "paid",
    bookingDate: new Date().toISOString().split('T')[0], // Today's date
    bookingTime: "10:00 AM",
    eWaiverSigned: true,
    eWaiverUrl: "https://example.com/waiver/sam-brown",
    emergencyContactName: "Jamie Brown",
    emergencyContactPhone: "555-654-3210"
  }
];
