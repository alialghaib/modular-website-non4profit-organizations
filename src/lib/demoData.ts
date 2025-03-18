
import { Hike } from './types';

// Demo hikes data for testing
export const DEMO_HIKES: Hike[] = [
  {
    id: "1",
    name: "Banff Sulphur Mountain Trail",
    date: "June 15, 2024",
    time: "8:00 AM",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86",
    difficulty: "moderate",
    location: "Banff National Park, AB",
    duration: "3-4 hours",
    price: 75,
    availableSpots: 10,
    bookedSpots: 4,
    description: "Scenic mountain hike with gondola access and stunning valley views."
  },
  {
    id: "2",
    name: "Bruce Trail Experience",
    date: "June 22, 2024",
    time: "9:00 AM",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    difficulty: "easy",
    location: "Niagara Region, ON",
    duration: "2-3 hours",
    price: 45,
    availableSpots: 15,
    bookedSpots: 2,
    description: "Beautiful trail along the Niagara Escarpment with waterfall views."
  },
  {
    id: "3",
    name: "Garibaldi Lake Trek",
    date: "July 5, 2024",
    time: "7:00 AM",
    image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716",
    difficulty: "hard",
    location: "Garibaldi Provincial Park, BC",
    duration: "6-7 hours",
    price: 95,
    availableSpots: 8,
    bookedSpots: 6,
    description: "Alpine lake hike with stunning mountain and glacier views."
  }
];
