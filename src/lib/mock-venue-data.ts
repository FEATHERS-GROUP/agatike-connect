export type MockVenue = {
  id: string;
  name: string;
  type: string;
  cover: string;
  cover_url?: string;
  price: number;
  currency: string;
  city?: string;
  location?: string;
  address?: string;
  rating: number;
  openTime?: string;
  closeTime?: string;
  opening_hours?: string;
  closing_hours?: string;
  description: string;
  country?: string;
  isMock?: boolean;
  bookingDisabled?: boolean;
  disabledReason?: string;
  source?: string;
  pricing_tiers?: { name: string; amount: number }[];
  status?: string;
};

export const mockVenues: MockVenue[] = [
  // Rwanda (local real-looking)
  {
    id: "v1",
    name: "Nyandugu Eco Park",
    type: "Park",
    cover: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800",
    price: 5000,
    currency: "RWF",
    location: "Kigali, Rwanda",
    city: "Kigali, Rwanda",
    country: "Rwanda",
    rating: 4.8,
    opening_hours: "08:00",
    closing_hours: "18:00",
    description: "Enjoy a beautiful natural wetland and park in the heart of Kigali. Perfect for cycling, walking, and bird watching.",
    pricing_tiers: [{ name: "Entry", amount: 5000 }],
  },
  {
    id: "v2",
    name: "Kigali Genocide Memorial",
    type: "Museum",
    cover: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800",
    price: 0,
    currency: "RWF",
    location: "Gisozi, Kigali",
    city: "Kigali, Rwanda",
    country: "Rwanda",
    rating: 4.9,
    opening_hours: "08:00",
    closing_hours: "17:00",
    description: "A place of remembrance and learning dedicated to the victims of the 1994 Genocide against the Tutsi.",
    pricing_tiers: [{ name: "Entry", amount: 0 }],
  },
  {
    id: "v3",
    name: "Century Cinema",
    type: "Entertainment",
    cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
    price: 4500,
    currency: "RWF",
    location: "KCT, Kigali",
    city: "Kigali, Rwanda",
    country: "Rwanda",
    rating: 4.5,
    opening_hours: "10:00",
    closing_hours: "23:00",
    description: "Experience the latest blockbusters in 3D and 5D formats.",
    pricing_tiers: [{ name: "Standard", amount: 4500 }],
  },

  // Kenya
  {
    id: "mock-ke-1",
    name: "Nairobi National Museum",
    type: "Museum",
    cover: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=800",
    price: 1200,
    currency: "KES",
    location: "Nairobi, Kenya",
    city: "Nairobi, Kenya",
    country: "Kenya",
    rating: 4.7,
    opening_hours: "08:30",
    closing_hours: "17:30",
    description: "Kenya's national museum showcasing the country's rich cultural heritage, history, and natural wonders.",
    isMock: true,
    bookingDisabled: true,
    disabledReason: "Not available in your region yet",
    pricing_tiers: [{ name: "Entry", amount: 1200 }],
  },
  {
    id: "mock-ke-2",
    name: "Karura Forest",
    type: "Park",
    cover: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800",
    price: 300,
    currency: "KES",
    location: "Nairobi, Kenya",
    city: "Nairobi, Kenya",
    country: "Kenya",
    rating: 4.9,
    opening_hours: "06:00",
    closing_hours: "18:00",
    description: "A stunning urban forest ideal for cycling, picnics, waterfalls, and peaceful nature walks in the heart of Nairobi.",
    isMock: true,
    bookingDisabled: true,
    disabledReason: "Not available in your region yet",
    pricing_tiers: [{ name: "Entry", amount: 300 }],
  },
  {
    id: "mock-ke-3",
    name: "Imax Cineplex Westgate",
    type: "Entertainment",
    cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800",
    price: 800,
    currency: "KES",
    location: "Westgate Mall, Nairobi",
    city: "Nairobi, Kenya",
    country: "Kenya",
    rating: 4.6,
    opening_hours: "10:00",
    closing_hours: "22:00",
    description: "Nairobi's premium IMAX cinema experience — crystal-clear screens and surround sound in a top-tier mall.",
    isMock: true,
    bookingDisabled: true,
    disabledReason: "Not available in your region yet",
    pricing_tiers: [{ name: "Standard", amount: 800 }],
  },

  // South Africa
  {
    id: "mock-za-1",
    name: "Robben Island Museum",
    type: "Museum",
    cover: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800",
    price: 650,
    currency: "ZAR",
    location: "Cape Town, South Africa",
    city: "Cape Town, South Africa",
    country: "South Africa",
    rating: 4.9,
    opening_hours: "09:00",
    closing_hours: "15:00",
    description: "The iconic island where Nelson Mandela was imprisoned for 18 years. A UNESCO World Heritage Site.",
    isMock: true,
    bookingDisabled: true,
    disabledReason: "Not available in your region yet",
    pricing_tiers: [{ name: "Adult Entry", amount: 650 }],
  },
  {
    id: "mock-za-2",
    name: "Gold Reef City Theme Park",
    type: "Entertainment",
    cover: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800",
    price: 399,
    currency: "ZAR",
    location: "Johannesburg, South Africa",
    city: "Johannesburg, South Africa",
    country: "South Africa",
    rating: 4.5,
    opening_hours: "09:30",
    closing_hours: "17:00",
    description: "Thrilling rides, live entertainment, and a historic gold mine experience in the heart of Johannesburg.",
    isMock: true,
    bookingDisabled: true,
    disabledReason: "Not available in your region yet",
    pricing_tiers: [{ name: "All-Day Pass", amount: 399 }],
  },

  // Madagascar
  {
    id: "mock-mg-1",
    name: "Parc National Andasibe",
    type: "Park",
    cover: "https://images.unsplash.com/photo-1609788329050-5ee3b4a7f05a?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1609788329050-5ee3b4a7f05a?auto=format&fit=crop&q=80&w=800",
    price: 25000,
    currency: "MGA",
    location: "Andasibe, Madagascar",
    city: "Andasibe, Madagascar",
    country: "Madagascar",
    rating: 4.8,
    opening_hours: "07:00",
    closing_hours: "17:00",
    description: "Home to the iconic Indri lemur and incredible biodiversity. A must-visit for nature lovers and wildlife enthusiasts.",
    isMock: true,
    bookingDisabled: true,
    disabledReason: "Not available in your region yet",
    pricing_tiers: [{ name: "Entry", amount: 25000 }],
  },

  // Morocco
  {
    id: "mock-ma-1",
    name: "Jardin Majorelle",
    type: "Park",
    cover: "https://images.unsplash.com/photo-1548813831-fd411d14e0e0?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1548813831-fd411d14e0e0?auto=format&fit=crop&q=80&w=800",
    price: 150,
    currency: "MAD",
    location: "Marrakech, Morocco",
    city: "Marrakech, Morocco",
    country: "Morocco",
    rating: 4.9,
    opening_hours: "08:00",
    closing_hours: "18:00",
    description: "The famous vivid blue botanical garden in Marrakech, once owned by Yves Saint Laurent. A truly magical place.",
    isMock: true,
    bookingDisabled: true,
    disabledReason: "Not available in your region yet",
    pricing_tiers: [{ name: "Adult Entry", amount: 150 }],
  },
  {
    id: "mock-ma-2",
    name: "Mohammed VI Museum of Modern Art",
    type: "Museum",
    cover: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=800",
    cover_url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=800",
    price: 70,
    currency: "MAD",
    location: "Rabat, Morocco",
    city: "Rabat, Morocco",
    country: "Morocco",
    rating: 4.7,
    opening_hours: "10:00",
    closing_hours: "18:00",
    description: "Morocco's largest museum of modern art featuring over 2,000 works by Moroccan and international artists.",
    isMock: true,
    bookingDisabled: true,
    disabledReason: "Not available in your region yet",
    pricing_tiers: [{ name: "Entry", amount: 70 }],
  },
];

