export interface Property {
  id: string;
  title: string;
  location: string;
  country: string;
  description: string;
  beds: number;
  baths: number;
  guests: number;
  type: "apartment" | "house" | "villa" | "cabin" | "studio";
  images: string[];
  rating: number;
  reviewCount: number;
  hostName: string;
  hostAvatar: string;
  available: boolean;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Sun-drenched Villa with Sea View",
    location: "Santorini, Greece",
    country: "Greece",
    description: "Wake up to stunning caldera views in this beautifully restored villa. Whitewashed walls, blue-domed charm, and a private terrace for sunset cocktails.",
    beds: 3,
    baths: 2,
    guests: 6,
    type: "villa",
    images: ["https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop"],
    rating: 4.9,
    reviewCount: 127,
    hostName: "Elena K.",
    hostAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
  {
    id: "2",
    title: "Cozy Montmartre Apartment",
    location: "Paris, France",
    country: "France",
    description: "A charming Parisian apartment in the heart of Montmartre, steps from Sacré-Cœur. Vintage furnishings meet modern comfort.",
    beds: 1,
    baths: 1,
    guests: 2,
    type: "apartment",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"],
    rating: 4.7,
    reviewCount: 89,
    hostName: "Marc D.",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
  {
    id: "3",
    title: "Mountain Cabin Retreat",
    location: "Chamonix, France",
    country: "France",
    description: "Escape to the Alps in this timber-framed cabin with panoramic mountain views. Perfect for hiking in summer and skiing in winter.",
    beds: 2,
    baths: 1,
    guests: 4,
    type: "cabin",
    images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop"],
    rating: 4.8,
    reviewCount: 64,
    hostName: "Sophie L.",
    hostAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
  {
    id: "4",
    title: "Minimalist Tokyo Studio",
    location: "Tokyo, Japan",
    country: "Japan",
    description: "Experience Japanese minimalism in this Shibuya studio. Tatami flooring, shoji screens, and walking distance to everything.",
    beds: 1,
    baths: 1,
    guests: 2,
    type: "studio",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"],
    rating: 4.6,
    reviewCount: 45,
    hostName: "Yuki T.",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
  {
    id: "5",
    title: "Beachfront House in Tulum",
    location: "Tulum, Mexico",
    country: "Mexico",
    description: "A bohemian-chic beach house right on the Caribbean. Fall asleep to the sound of waves and wake up to turquoise waters.",
    beds: 4,
    baths: 3,
    guests: 8,
    type: "house",
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=600&fit=crop"],
    rating: 4.9,
    reviewCount: 203,
    hostName: "Carlos M.",
    hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
  {
    id: "6",
    title: "Historic Lisbon Townhouse",
    location: "Lisbon, Portugal",
    country: "Portugal",
    description: "A beautifully tiled townhouse in Alfama. Hear fado music drifting through the streets from your private balcony.",
    beds: 2,
    baths: 2,
    guests: 4,
    type: "house",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"],
    rating: 4.8,
    reviewCount: 156,
    hostName: "Ana R.",
    hostAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
];

export const popularDestinations = [
  { name: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop" },
  { name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop" },
  { name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop" },
  { name: "Tulum", country: "Mexico", image: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=400&h=300&fit=crop" },
];
