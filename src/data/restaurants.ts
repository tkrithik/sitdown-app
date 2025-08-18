import { Restaurant } from '../types';

// Deterministic pseudo-random number generator (Mulberry32)
// Ensures the same "random" data is generated across devices/sessions
function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return function rand() {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const sampleRestaurants: Restaurant[] = [
  // Fast Casual & Quick Bites (15 restaurants)
  {
    id: '1',
    name: 'Campus Burgers',
    cuisine_type: 'American',
    price_range: '$',
    rating: 4.2,
    address: '123 College Ave, Santa Clara, CA 95050',
    phone: '(555) 123-4567',
    hours: {
      monday: '11:00 AM - 11:00 PM',
      tuesday: '11:00 AM - 11:00 PM',
      wednesday: '11:00 AM - 11:00 PM',
      thursday: '11:00 AM - 12:00 AM',
      friday: '11:00 AM - 1:00 AM',
      saturday: '11:00 AM - 1:00 AM',
      sunday: '12:00 PM - 10:00 PM'
    },
    coordinates: { latitude: 37.3382, longitude: -121.8863 }, // Santa Clara, CA
    dietary_options: ['vegetarian'],
    features: ['late_night', 'takeout', 'outdoor_seating'],
    description: 'Classic American burgers and fries with a college-friendly atmosphere. Known for their veggie burger and late-night hours.',
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2',
      'https://picsum.photos/400/300?random=3',
      'https://picsum.photos/400/300?random=4',
      'https://picsum.photos/400/300?random=5',
    ],
    popular_dishes: ['Campus Classic Burger', 'Veggie Delight Burger', 'Sweet Potato Fries', 'Craft Milkshakes']
  },
  {
    id: '2',
    name: 'Taco Express',
    cuisine_type: 'Mexican',
    price_range: '$',
    rating: 4.0,
    address: '456 Main St, Santa Clara, CA 95050',
    phone: '(555) 234-5678',
    hours: {
      monday: '10:00 AM - 10:00 PM',
      tuesday: '10:00 AM - 10:00 PM',
      wednesday: '10:00 AM - 10:00 PM',
      thursday: '10:00 AM - 10:00 PM',
      friday: '10:00 AM - 11:00 PM',
      saturday: '10:00 AM - 11:00 PM',
      sunday: '11:00 AM - 9:00 PM'
    },
    coordinates: { latitude: 37.3395, longitude: -121.8850 }, // Santa Clara, CA
    dietary_options: ['vegan', 'vegetarian'],
    features: ['quick_service', 'takeout'],
    description: 'Authentic Mexican tacos and burritos with fresh ingredients and vegan options.',
    images: [
      'https://picsum.photos/400/300?random=6',
      'https://picsum.photos/400/300?random=7',
      'https://picsum.photos/400/300?random=8',
      'https://picsum.photos/400/300?random=9',
      'https://picsum.photos/400/300?random=10',
    ],
    popular_dishes: ['Street Tacos', 'Vegan Burrito', 'Guacamole', 'Horchata']
  },
  {
    id: '3',
    name: 'Pita Palace',
    cuisine_type: 'Mediterranean',
    price_range: '$',
    rating: 4.3,
    address: '789 Oak St, Santa Clara, CA 95050',
    phone: '(555) 345-6789',
    hours: {
      monday: '11:00 AM - 9:00 PM',
      tuesday: '11:00 AM - 9:00 PM',
      wednesday: '11:00 AM - 9:00 PM',
      thursday: '11:00 AM - 9:00 PM',
      friday: '11:00 AM - 10:00 PM',
      saturday: '11:00 AM - 10:00 PM',
      sunday: '12:00 PM - 8:00 PM'
    },
    coordinates: { latitude: 37.3370, longitude: -121.8875 }, // Santa Clara, CA
    dietary_options: ['vegetarian', 'vegan', 'gluten-free'],
    features: ['healthy', 'takeout'],
    description: 'Fresh Mediterranean wraps and bowls with falafel, hummus, and healthy options.',
    images: [
      'https://picsum.photos/400/300?random=11',
      'https://picsum.photos/400/300?random=12',
      'https://picsum.photos/400/300?random=13',
      'https://picsum.photos/400/300?random=14',
      'https://picsum.photos/400/300?random=15',
    ],
    popular_dishes: ['Falafel Wrap', 'Hummus Bowl', 'Greek Salad', 'Baklava']
  },
  {
    id: '4',
    name: 'Noodle Box',
    cuisine_type: 'Asian Fusion',
    price_range: '$',
    rating: 4.1,
    address: '321 Pine St, Santa Clara, CA 95050',
    phone: '(555) 456-7890',
    hours: {
      monday: '11:30 AM - 10:00 PM',
      tuesday: '11:30 AM - 10:00 PM',
      wednesday: '11:30 AM - 10:00 PM',
      thursday: '11:30 AM - 10:00 PM',
      friday: '11:30 AM - 11:00 PM',
      saturday: '11:30 AM - 11:00 PM',
      sunday: '12:00 PM - 9:00 PM'
    },
    coordinates: { latitude: 37.3400, longitude: -121.8840 }, // Santa Clara, CA
    dietary_options: ['gluten-free', 'vegetarian'],
    features: ['quick_service', 'takeout'],
    description: 'Asian fusion noodles and rice bowls with gluten-free options.',
    images: [
      'https://picsum.photos/400/300?random=16',
      'https://picsum.photos/400/300?random=17',
      'https://picsum.photos/400/300?random=18',
      'https://picsum.photos/400/300?random=19',
      'https://picsum.photos/400/300?random=20',
    ],
    popular_dishes: ['Pad Thai', 'Buddha Bowl', 'Spring Rolls', 'Thai Iced Tea']
  },
  {
    id: '5',
    name: 'Fresh Salad Co',
    cuisine_type: 'Healthy',
    price_range: '$',
    rating: 4.4,
    address: '654 Elm St, Santa Clara, CA 95050',
    phone: '(555) 567-8901',
    hours: {
      monday: '10:00 AM - 8:00 PM',
      tuesday: '10:00 AM - 8:00 PM',
      wednesday: '10:00 AM - 8:00 PM',
      thursday: '10:00 AM - 8:00 PM',
      friday: '10:00 AM - 8:00 PM',
      saturday: '10:00 AM - 6:00 PM',
      sunday: '11:00 AM - 6:00 PM'
    },
    coordinates: { latitude: 37.3365, longitude: -121.8880 }, // Santa Clara, CA
    dietary_options: ['vegan', 'vegetarian', 'gluten-free'],
    features: ['healthy', 'takeout'],
    description: 'Fresh, healthy salads and bowls with organic ingredients.',
    images: [
      'https://picsum.photos/400/300?random=21',
      'https://picsum.photos/400/300?random=22',
      'https://picsum.photos/400/300?random=23',
      'https://picsum.photos/400/300?random=24',
      'https://picsum.photos/400/300?random=25',
    ],
    popular_dishes: ['Garden Salad', 'Quinoa Bowl', 'Acai Bowl', 'Green Smoothie']
  },
  // Casual Dining (20 restaurants)
  {
    id: '6',
    name: 'The Study Hall',
    cuisine_type: 'American',
    price_range: '$$',
    rating: 4.5,
    address: '987 University Blvd, Santa Clara, CA 95050',
    phone: '(555) 678-9012',
    hours: {
      monday: '11:00 AM - 11:00 PM',
      tuesday: '11:00 AM - 11:00 PM',
      wednesday: '11:00 AM - 11:00 PM',
      thursday: '11:00 AM - 12:00 AM',
      friday: '11:00 AM - 1:00 AM',
      saturday: '11:00 AM - 1:00 AM',
      sunday: '12:00 PM - 10:00 PM'
    },
    coordinates: { latitude: 37.3410, longitude: -121.8830 }, // Santa Clara, CA
    dietary_options: ['vegetarian'],
    features: ['full_bar', 'study_friendly', 'wifi'],
    description: 'College-friendly restaurant with great food, full bar, and study atmosphere.',
    images: [
      'https://picsum.photos/400/300?random=26',
      'https://picsum.photos/400/300?random=27',
      'https://picsum.photos/400/300?random=28',
      'https://picsum.photos/400/300?random=29',
      'https://picsum.photos/400/300?random=30',
    ],
    popular_dishes: ['Study Burger', 'Mac & Cheese', 'Craft Beer', 'Wings']
  },
  {
    id: '7',
    name: 'Bistro 21',
    cuisine_type: 'French/American',
    price_range: '$$',
    rating: 4.6,
    address: '147 Campus Dr, Santa Clara, CA 95050',
    phone: '(555) 789-0123',
    hours: {
      monday: '5:00 PM - 10:00 PM',
      tuesday: '5:00 PM - 10:00 PM',
      wednesday: '5:00 PM - 10:00 PM',
      thursday: '5:00 PM - 11:00 PM',
      friday: '5:00 PM - 11:00 PM',
      saturday: '5:00 PM - 11:00 PM',
      sunday: '5:00 PM - 9:00 PM'
    },
    coordinates: { latitude: 37.3355, longitude: -121.8890 }, // Santa Clara, CA
    dietary_options: ['vegetarian'],
    features: ['wine_selection', 'date_spot', 'fine_dining'],
    description: 'Elegant French-American bistro perfect for dates and special occasions.',
    images: [
      'https://picsum.photos/400/300?random=31',
      'https://picsum.photos/400/300?random=32',
      'https://picsum.photos/400/300?random=33',
      'https://picsum.photos/400/300?random=34',
      'https://picsum.photos/400/300?random=35',
    ],
    popular_dishes: ['Coq au Vin', 'Beef Bourguignon', 'French Onion Soup', 'Wine Selection']
  },
  {
    id: '8',
    name: 'Campus Thai',
    cuisine_type: 'Thai',
    price_range: '$$',
    rating: 4.3,
    address: '258 Student Center Way, Santa Clara, CA 95050',
    phone: '(555) 890-1234',
    hours: {
      monday: '11:00 AM - 10:00 PM',
      tuesday: '11:00 AM - 10:00 PM',
      wednesday: '11:00 AM - 10:00 PM',
      thursday: '11:00 AM - 10:00 PM',
      friday: '11:00 AM - 11:00 PM',
      saturday: '11:00 AM - 11:00 PM',
      sunday: '12:00 PM - 9:00 PM'
    },
    coordinates: { latitude: 37.3420, longitude: -121.8820 }, // Santa Clara, CA
    dietary_options: ['vegetarian', 'vegan'],
    features: ['spice_levels', 'takeout'],
    description: 'Authentic Thai cuisine with customizable spice levels and vegetarian options.',
    images: [
      'https://picsum.photos/400/300?random=36',
      'https://picsum.photos/400/300?random=37',
      'https://picsum.photos/400/300?random=38',
      'https://picsum.photos/400/300?random=39',
      'https://picsum.photos/400/300?random=40',
    ],
    popular_dishes: ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice']
  },
  // Bars & Social Spots (10 restaurants)
  {
    id: '9',
    name: 'The Campus Pub',
    cuisine_type: 'Bar/American',
    price_range: '$$',
    rating: 4.2,
    address: '369 College Ave, Santa Clara, CA 95050',
    phone: '(555) 901-2345',
    hours: {
      monday: '4:00 PM - 2:00 AM',
      tuesday: '4:00 PM - 2:00 AM',
      wednesday: '4:00 PM - 2:00 AM',
      thursday: '4:00 PM - 2:00 AM',
      friday: '4:00 PM - 2:00 AM',
      saturday: '4:00 PM - 2:00 AM',
      sunday: '4:00 PM - 12:00 AM'
    },
    coordinates: { latitude: 37.3430, longitude: -121.8810 }, // Santa Clara, CA
    dietary_options: ['vegetarian'],
    features: ['late_night', 'sports_bar', 'full_bar'],
    description: 'Popular college bar with great food, sports on TV, and late-night hours.',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'],
    popular_dishes: ['Pub Burger', 'Wings', 'Nachos', 'Craft Beer']
  },
  {
    id: '10',
    name: 'Rooftop Lounge',
    cuisine_type: 'Bar/Small plates',
    price_range: '$$$',
    rating: 4.7,
    address: '741 Downtown Ave, Santa Clara, CA 95050',
    phone: '(555) 012-3456',
    hours: {
      monday: '5:00 PM - 12:00 AM',
      tuesday: '5:00 PM - 12:00 AM',
      wednesday: '5:00 PM - 12:00 AM',
      thursday: '5:00 PM - 1:00 AM',
      friday: '5:00 PM - 2:00 AM',
      saturday: '5:00 PM - 2:00 AM',
      sunday: '5:00 PM - 11:00 PM'
    },
    coordinates: { latitude: 37.3340, longitude: -121.8900 }, // Santa Clara, CA
    dietary_options: ['vegetarian'],
    features: ['city_views', 'cocktails', 'rooftop'],
    description: 'Upscale rooftop bar with stunning city views and craft cocktails.',
    images: [
      'https://picsum.photos/400/300?random=41',
      'https://picsum.photos/400/300?random=42',
      'https://picsum.photos/400/300?random=43',
      'https://picsum.photos/400/300?random=44',
      'https://picsum.photos/400/300?random=45',
    ],
    popular_dishes: ['Craft Cocktails', 'Small Plates', 'Cheese Board', 'Wine Selection']
  },
  // Coffee & Breakfast (5 restaurants)
  {
    id: '11',
    name: 'Morning Grind',
    cuisine_type: 'Coffee/Breakfast',
    price_range: '$',
    rating: 4.4,
    address: '852 Coffee St, Santa Clara, CA 95050',
    phone: '(555) 123-4567',
    hours: {
      monday: '6:00 AM - 8:00 PM',
      tuesday: '6:00 AM - 8:00 PM',
      wednesday: '6:00 AM - 8:00 PM',
      thursday: '6:00 AM - 8:00 PM',
      friday: '6:00 AM - 8:00 PM',
      saturday: '7:00 AM - 8:00 PM',
      sunday: '7:00 AM - 6:00 PM'
    },
    coordinates: { latitude: 37.3440, longitude: -121.8800 }, // Santa Clara, CA
    dietary_options: ['vegan', 'vegetarian'],
    features: ['vegan_milk', 'study_spot', 'wifi'],
    description: 'Cozy coffee shop with vegan milk options and great study atmosphere.',
    images: [
      'https://picsum.photos/400/300?random=46',
      'https://picsum.photos/400/300?random=47',
      'https://picsum.photos/400/300?random=48',
      'https://picsum.photos/400/300?random=49',
      'https://picsum.photos/400/300?random=50',
    ],
    popular_dishes: ['Latte', 'Avocado Toast', 'Vegan Muffins', 'Cold Brew']
  }
];

// Add more restaurants to reach 50 total
export const generateMoreRestaurants = (): Restaurant[] => {
  const cuisines = ['Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Mediterranean', 'American', 'Thai', 'Vietnamese', 'Greek'];
  const priceRanges = ['$', '$$', '$$$'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free'];
  const features = ['takeout', 'delivery', 'outdoor_seating', 'wifi', 'full_bar', 'late_night'];
  
  // Use a fixed seed so all devices see the same generated data
  const rand = createSeededRandom(123456789);
  
  const restaurants: Restaurant[] = [];
  
  for (let i = 12; i <= 50; i++) {
    const cuisine = cuisines[Math.floor(rand() * cuisines.length)];
    const priceRange = priceRanges[Math.floor(rand() * priceRanges.length)];
    const dietary = dietaryOptions.filter(() => rand() > 0.5);
    const feature = features.filter(() => rand() > 0.6);
    
    restaurants.push({
      id: i.toString(),
      name: `${cuisine} Place ${i}`,
      cuisine_type: cuisine,
      price_range: priceRange,
      rating: 3.5 + rand() * 1.5,
      address: `${i * 100} Sample St, Santa Clara, CA 95050`,
      phone: `(555) ${String(i).padStart(3, '0')}-${String(i * 2).padStart(4, '0')}`,
      hours: {
        monday: '11:00 AM - 10:00 PM',
        tuesday: '11:00 AM - 10:00 PM',
        wednesday: '11:00 AM - 10:00 PM',
        thursday: '11:00 AM - 10:00 PM',
        friday: '11:00 AM - 11:00 PM',
        saturday: '11:00 AM - 11:00 PM',
        sunday: '12:00 PM - 9:00 PM'
      },
      coordinates: {
        latitude: 37.3382 + (rand() - 0.5) * 0.01, // Santa Clara area
        longitude: -121.8863 + (rand() - 0.5) * 0.01 // Santa Clara area
      },
      dietary_options: dietary,
      features: feature,
      description: `Delicious ${cuisine.toLowerCase()} cuisine with great atmosphere and service.`,
      images: [
        `https://picsum.photos/400/300?random=${i * 3 + 51}`,
        `https://picsum.photos/400/300?random=${i * 3 + 52}`,
        `https://picsum.photos/400/300?random=${i * 3 + 53}`,
        `https://picsum.photos/400/300?random=${i * 3 + 54}`,
        `https://picsum.photos/400/300?random=${i * 3 + 55}`,
      ],
      popular_dishes: [`${cuisine} Special`, 'House Favorite', 'Chef\'s Choice', 'Signature Dish']
    });
  }
  
  return restaurants;
};

export const allRestaurants = [...sampleRestaurants, ...generateMoreRestaurants()];

