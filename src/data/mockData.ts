import property1 from "@/assets/property1.jpg";
import property2 from "@/assets/property2.jpg";
import property3 from "@/assets/property3.jpg";
import property4 from "@/assets/property4.jpg";

export interface Property {
  id: string;
  title: string;
  type: "rental" | "shortstay";
  county: string;
  estate: string;
  price: number;
  priceUnit: string;
  bedrooms: number;
  bathrooms: number;
  image: string;
  verified: boolean;
  featured: boolean;
  available: boolean;
  amenities: string[];
  landlordResponseTime: string;
  lastActive: string;
  nearbyLandmarks: string[];
  description: string;
  images: string[];
  stayRules?: string[];
  hostTrustBadge?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  responseSpeed: string;
  areaServed: string;
  tier: "Basic" | "Pro" | "Premium";
  boosted: boolean;
  avatar: string;
  description: string;
}

export const properties: Property[] = [
  {
    id: "1",
    title: "Luxurious 3BR Apartment with City Views",
    type: "rental",
    county: "Nairobi",
    estate: "Kilimani",
    price: 85000,
    priceUnit: "/mo",
    bedrooms: 3,
    bathrooms: 2,
    image: property1,
    verified: true,
    featured: true,
    available: true,
    amenities: ["Parking", "Gym", "Swimming Pool", "Security", "Backup Generator", "Fiber Internet"],
    landlordResponseTime: "< 1 hour",
    lastActive: "2 mins ago",
    nearbyLandmarks: ["Yaya Centre", "Junction Mall", "Nairobi Hospital"],
    description: "Spacious 3-bedroom apartment in the heart of Kilimani with stunning city views. Modern finishes, 24/7 security, and all amenities included.",
    images: [property1, property2, property3, property4],
  },
  {
    id: "2",
    title: "Modern 2BR with Pool Access",
    type: "rental",
    county: "Nairobi",
    estate: "Westlands",
    price: 65000,
    priceUnit: "/mo",
    bedrooms: 2,
    bathrooms: 2,
    image: property2,
    verified: true,
    featured: false,
    available: true,
    amenities: ["Parking", "Swimming Pool", "CCTV", "Elevator", "Rooftop Terrace"],
    landlordResponseTime: "< 30 mins",
    lastActive: "5 mins ago",
    nearbyLandmarks: ["Sarit Centre", "The Hub", "Westgate"],
    description: "Beautiful 2-bedroom apartment in a secure complex with pool, gym, and rooftop terrace. Walking distance to Sarit Centre.",
    images: [property2, property1, property3, property4],
  },
  {
    id: "3",
    title: "Cozy Furnished Studio in Westlands",
    type: "shortstay",
    county: "Nairobi",
    estate: "Westlands",
    price: 4500,
    priceUnit: "/night",
    bedrooms: 1,
    bathrooms: 1,
    image: property3,
    verified: true,
    featured: true,
    available: true,
    amenities: ["WiFi", "Smart TV", "Kitchen", "Workspace", "Parking"],
    landlordResponseTime: "Instant",
    lastActive: "Online",
    nearbyLandmarks: ["Sarit Centre", "Westlands CBD"],
    description: "Fully furnished studio perfect for short stays. Fast WiFi, smart TV, and fully equipped kitchen.",
    images: [property3, property1, property2, property4],
    stayRules: ["No smoking", "No parties", "Check-in: 2PM", "Check-out: 11AM", "Max 2 guests"],
    hostTrustBadge: true,
  },
  {
    id: "4",
    title: "Penthouse with Panoramic Views",
    type: "shortstay",
    county: "Nairobi",
    estate: "Kilimani",
    price: 12000,
    priceUnit: "/night",
    bedrooms: 3,
    bathrooms: 3,
    image: property4,
    verified: true,
    featured: false,
    available: true,
    amenities: ["Rooftop Terrace", "Jacuzzi", "BBQ Area", "WiFi", "Smart Home", "Concierge"],
    landlordResponseTime: "< 15 mins",
    lastActive: "1 min ago",
    nearbyLandmarks: ["Prestige Plaza", "T-Mall", "Galleria"],
    description: "Stunning penthouse with 360° city views. Perfect for luxury getaways with rooftop jacuzzi and BBQ.",
    images: [property4, property1, property2, property3],
    stayRules: ["No smoking indoors", "Quiet hours: 10PM-7AM", "Check-in: 3PM", "Check-out: 12PM"],
    hostTrustBadge: true,
  },
];

export const serviceProviders: ServiceProvider[] = [
  { id: "s1", name: "SwiftMovers KE", category: "Movers", rating: 4.8, reviews: 234, responseSpeed: "< 5 mins", areaServed: "Nairobi & Environs", tier: "Premium", boosted: true, avatar: "🚛", description: "Professional moving services across Nairobi" },
  { id: "s2", name: "CleanPro Solutions", category: "Cleaners", rating: 4.6, reviews: 189, responseSpeed: "< 15 mins", areaServed: "Nairobi", tier: "Pro", boosted: false, avatar: "🧹", description: "Deep cleaning and regular housekeeping" },
  { id: "s3", name: "PowerFix Electricals", category: "Electricians", rating: 4.9, reviews: 312, responseSpeed: "< 10 mins", areaServed: "Nairobi, Kiambu", tier: "Premium", boosted: true, avatar: "⚡", description: "Licensed electricians for all installations" },
  { id: "s4", name: "PipeMaster Plumbing", category: "Plumbers", rating: 4.5, reviews: 156, responseSpeed: "< 20 mins", areaServed: "Nairobi", tier: "Pro", boosted: false, avatar: "🔧", description: "Emergency and scheduled plumbing services" },
  { id: "s5", name: "NetConnect KE", category: "Internet Installers", rating: 4.7, reviews: 278, responseSpeed: "< 30 mins", areaServed: "Nairobi, Mombasa", tier: "Premium", boosted: false, avatar: "📡", description: "Fiber and WiFi installation specialists" },
  { id: "s6", name: "GuardPro Security", category: "Security", rating: 4.8, reviews: 198, responseSpeed: "< 10 mins", areaServed: "Nationwide", tier: "Basic", boosted: false, avatar: "🛡️", description: "CCTV, alarms, and guard services" },
];
