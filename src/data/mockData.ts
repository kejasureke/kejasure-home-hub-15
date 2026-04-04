import property1 from "@/assets/property1.jpg";
import property2 from "@/assets/property2.jpg";
import property3 from "@/assets/property3.jpg";
import property4 from "@/assets/property4.jpg";

export interface Property {
  id: string;
  title: string;
  type: "rental" | "shortstay";
  county: string;
  subcounty: string;
  ward: string;
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
  landlordResponseSpeed: "fast" | "moderate" | "slow";
  lastActive: string;
  nearbyLandmarks: string[];
  description: string;
  images: string[];
  stayRules?: string[];
  hostTrustBadge?: boolean;
  deposit?: number;
  moveInDate?: string;
  furnished?: boolean;
  petFriendly?: boolean;
  floor?: string;
  size?: string;
  yearBuilt?: number;
  rating?: number;
  reviewCount?: number;
  lat: number;
  lng: number;
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
  price?: string;
  availability?: string;
  lat: number;
  lng: number;
}

export const properties: Property[] = [
  {
    id: "1",
    title: "Luxurious 3BR Apartment with City Views",
    type: "rental",
    county: "Nairobi",
    subcounty: "Dagoretti North",
    ward: "Kilimani",
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
    landlordResponseSpeed: "fast",
    lastActive: "2 mins ago",
    nearbyLandmarks: ["Yaya Centre", "Junction Mall", "Nairobi Hospital"],
    description: "Spacious 3-bedroom apartment in the heart of Kilimani with stunning city views. Modern finishes, 24/7 security, and all amenities included.",
    images: [property1, property2, property3, property4],
    deposit: 85000,
    moveInDate: "Immediate",
    furnished: false,
    petFriendly: false,
    floor: "12th Floor",
    size: "150 sqm",
    yearBuilt: 2021,
    rating: 4.8,
    reviewCount: 24,
    lat: -1.2864,
    lng: 36.7834,
  },
  {
    id: "2",
    title: "Modern 2BR with Pool Access",
    type: "rental",
    county: "Nairobi",
    subcounty: "Westlands",
    ward: "Parklands/Highridge",
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
    landlordResponseSpeed: "fast",
    lastActive: "5 mins ago",
    nearbyLandmarks: ["Sarit Centre", "The Hub", "Westgate"],
    description: "Beautiful 2-bedroom apartment in a secure complex with pool, gym, and rooftop terrace. Walking distance to Sarit Centre.",
    images: [property2, property1, property3, property4],
    deposit: 65000,
    moveInDate: "1st May 2026",
    furnished: true,
    petFriendly: true,
    floor: "5th Floor",
    size: "110 sqm",
    yearBuilt: 2019,
    rating: 4.6,
    reviewCount: 18,
    lat: -1.2637,
    lng: 36.8033,
  },
  {
    id: "3",
    title: "Cozy Furnished Studio in Westlands",
    type: "shortstay",
    county: "Nairobi",
    subcounty: "Westlands",
    ward: "Parklands/Highridge",
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
    landlordResponseSpeed: "fast",
    lastActive: "Online",
    nearbyLandmarks: ["Sarit Centre", "Westlands CBD"],
    description: "Fully furnished studio perfect for short stays. Fast WiFi, smart TV, and fully equipped kitchen.",
    images: [property3, property1, property2, property4],
    stayRules: ["No smoking", "No parties", "Check-in: 2PM", "Check-out: 11AM", "Max 2 guests"],
    hostTrustBadge: true,
    rating: 4.9,
    reviewCount: 67,
    lat: -1.2650,
    lng: 36.8100,
  },
  {
    id: "4",
    title: "Penthouse with Panoramic Views",
    type: "shortstay",
    county: "Nairobi",
    subcounty: "Dagoretti North",
    ward: "Kilimani",
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
    landlordResponseSpeed: "fast",
    lastActive: "1 min ago",
    nearbyLandmarks: ["Prestige Plaza", "T-Mall", "Galleria"],
    description: "Stunning penthouse with 360° city views. Perfect for luxury getaways with rooftop jacuzzi and BBQ.",
    images: [property4, property1, property2, property3],
    stayRules: ["No smoking indoors", "Quiet hours: 10PM-7AM", "Check-in: 3PM", "Check-out: 12PM"],
    hostTrustBadge: true,
    rating: 4.7,
    reviewCount: 41,
    lat: -1.2921,
    lng: 36.7810,
  },
  {
    id: "5",
    title: "Spacious 1BR in South B",
    type: "rental",
    county: "Nairobi",
    subcounty: "Makadara",
    ward: "Maringo/Hamza",
    estate: "South B",
    price: 30000,
    priceUnit: "/mo",
    bedrooms: 1,
    bathrooms: 1,
    image: property3,
    verified: true,
    featured: false,
    available: true,
    amenities: ["Parking", "Security", "Water Tank", "Balcony"],
    landlordResponseTime: "< 2 hours",
    landlordResponseSpeed: "moderate",
    lastActive: "30 mins ago",
    nearbyLandmarks: ["Capital Centre", "Mater Hospital", "South B Shopping Centre"],
    description: "Well-maintained 1-bedroom apartment in a quiet neighborhood. Spacious rooms with ample natural light.",
    images: [property3, property2, property1, property4],
    deposit: 30000,
    moveInDate: "Immediate",
    furnished: false,
    petFriendly: false,
    floor: "3rd Floor",
    size: "55 sqm",
    yearBuilt: 2018,
    rating: 4.3,
    reviewCount: 12,
    lat: -1.3100,
    lng: 36.8350,
  },
  {
    id: "6",
    title: "Executive 2BR in Karen",
    type: "rental",
    county: "Nairobi",
    subcounty: "Lang'ata",
    ward: "Karen",
    estate: "Karen",
    price: 120000,
    priceUnit: "/mo",
    bedrooms: 2,
    bathrooms: 2,
    image: property1,
    verified: true,
    featured: true,
    available: true,
    amenities: ["Garden", "Parking", "Security", "Servant Quarter", "Backup Generator", "Borehole"],
    landlordResponseTime: "< 1 hour",
    landlordResponseSpeed: "fast",
    lastActive: "15 mins ago",
    nearbyLandmarks: ["Karen Country Club", "The Hub Karen", "Galleria"],
    description: "Executive 2-bedroom apartment in serene Karen. Lush gardens, spacious rooms, and premium finishes.",
    images: [property1, property4, property2, property3],
    deposit: 120000,
    moveInDate: "1st June 2026",
    furnished: true,
    petFriendly: true,
    floor: "Ground Floor",
    size: "180 sqm",
    yearBuilt: 2022,
    rating: 4.9,
    reviewCount: 8,
  },
  {
    id: "7",
    title: "Beach View Studio in Nyali",
    type: "shortstay",
    county: "Mombasa",
    subcounty: "Nyali",
    ward: "Nyali",
    estate: "Nyali",
    price: 6500,
    priceUnit: "/night",
    bedrooms: 1,
    bathrooms: 1,
    image: property2,
    verified: true,
    featured: true,
    available: true,
    amenities: ["Ocean View", "WiFi", "Pool", "Beach Access", "AC", "Kitchen"],
    landlordResponseTime: "< 30 mins",
    landlordResponseSpeed: "fast",
    lastActive: "Online",
    nearbyLandmarks: ["Nyali Beach", "City Mall Nyali", "Mombasa Marine Park"],
    description: "Wake up to ocean views in this beautifully furnished studio. Steps from Nyali Beach.",
    images: [property2, property3, property4, property1],
    stayRules: ["No smoking", "Check-in: 2PM", "Check-out: 11AM"],
    hostTrustBadge: true,
    rating: 4.8,
    reviewCount: 93,
  },
  {
    id: "8",
    title: "Affordable Bedsitter in Roysambu",
    type: "rental",
    county: "Nairobi",
    subcounty: "Roysambu",
    ward: "Zimmerman",
    estate: "Roysambu",
    price: 12000,
    priceUnit: "/mo",
    bedrooms: 1,
    bathrooms: 1,
    image: property4,
    verified: false,
    featured: false,
    available: true,
    amenities: ["Water", "Security", "Tiled"],
    landlordResponseTime: "< 4 hours",
    landlordResponseSpeed: "slow",
    lastActive: "2 hours ago",
    nearbyLandmarks: ["TRM", "Thika Road", "USIU"],
    description: "Clean and affordable bedsitter near TRM. Good for students and young professionals.",
    images: [property4, property1, property2, property3],
    deposit: 12000,
    moveInDate: "Immediate",
    furnished: false,
    petFriendly: false,
    floor: "2nd Floor",
    size: "25 sqm",
    yearBuilt: 2015,
    rating: 4.0,
    reviewCount: 5,
  },
];

export const serviceProviders: ServiceProvider[] = [
  { id: "s1", name: "SwiftMovers KE", category: "Movers", rating: 4.8, reviews: 234, responseSpeed: "< 5 mins", areaServed: "Nairobi & Environs", tier: "Premium", boosted: true, avatar: "🚛", description: "Professional moving services across Nairobi", price: "From KES 5,000", availability: "Same day" },
  { id: "s2", name: "CleanPro Solutions", category: "Cleaners", rating: 4.6, reviews: 189, responseSpeed: "< 15 mins", areaServed: "Nairobi", tier: "Pro", boosted: false, avatar: "🧹", description: "Deep cleaning and regular housekeeping", price: "From KES 2,500", availability: "Next day" },
  { id: "s3", name: "PowerFix Electricals", category: "Electricians", rating: 4.9, reviews: 312, responseSpeed: "< 10 mins", areaServed: "Nairobi, Kiambu", tier: "Premium", boosted: true, avatar: "⚡", description: "Licensed electricians for all installations", price: "From KES 1,500", availability: "Same day" },
  { id: "s4", name: "PipeMaster Plumbing", category: "Plumbers", rating: 4.5, reviews: 156, responseSpeed: "< 20 mins", areaServed: "Nairobi", tier: "Pro", boosted: false, avatar: "🔧", description: "Emergency and scheduled plumbing services", price: "From KES 1,000", availability: "2 hours" },
  { id: "s5", name: "NetConnect KE", category: "Internet Installers", rating: 4.7, reviews: 278, responseSpeed: "< 30 mins", areaServed: "Nairobi, Mombasa", tier: "Premium", boosted: false, avatar: "📡", description: "Fiber and WiFi installation specialists", price: "From KES 3,000", availability: "Next day" },
  { id: "s6", name: "GuardPro Security", category: "Security", rating: 4.8, reviews: 198, responseSpeed: "< 10 mins", areaServed: "Nationwide", tier: "Basic", boosted: false, avatar: "🛡️", description: "CCTV, alarms, and guard services", price: "From KES 8,000/mo", availability: "48 hours" },
];
