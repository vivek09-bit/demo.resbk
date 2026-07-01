/* ============================================
   Dummy restaurant data — purely frontend mock
   Swap this file for real API data later
   ============================================ */

import type { RestaurantSummary, RestaurantDetail } from './types'

/** Convert a restaurant name to a URL-friendly slug */
export function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

/** Find a restaurant detail by its slug */
export function getDetailBySlug(slug: string): RestaurantDetail | undefined {
    return DETAILS.find((d) => toSlug(d.name) === slug)
}

// ─── Gallery metadata shared across restaurants ──────────────────────────

export const GALLERY_GRADIENTS = [
    'from-rose-400/30 to-pink-500/20',
    'from-amber-400/30 to-orange-500/20',
    'from-emerald-400/30 to-teal-500/20',
    'from-blue-400/30 to-indigo-500/20',
    'from-purple-400/30 to-violet-500/20',
    'from-cyan-400/30 to-sky-500/20',
]

export const GALLERY_LABELS = [
    'Main Dining Hall', 'Bar & Lounge', 'Outdoor Terrace',
    'Chef\'s Special Platter', 'Signature Cocktails', 'Private Dining Room',
]

// ─── Helpers ─────────────────────────────────────────────────────────────

function hoursFromString(str: string): DayHours[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const parts = str.split('|').map(s => s.trim())
    return days.map((day, i) => ({
        day,
        hours: parts[i] || parts[0] || '11:00 AM – 11:00 PM',
    }))
}

import type { DayHours } from './types'
import { COVERS, LOGOS, GALLERIES } from './foodImages'

// ─── Full dummy restaurants (detail view) ────────────────────────────────

const DETAILS: RestaurantDetail[] = [
    {
        id: 'rest-001',
        name: 'Punjab Grill House',
        coverImage: COVERS['rest-001'],
        logoUrl: LOGOS['rest-001'],
        photos: GALLERIES['rest-001'],
        description:
            'Punjab Grill House brings the authentic flavours of North India to your plate. ' +
            'Founded in 2018, we have been serving traditional Punjabi cuisine made with love, ' +
            'fresh ingredients, and generations-old family recipes. Our chefs hail from Amritsar ' +
            'and Delhi, bringing with them the expertise of classic tandoor cooking and rich, ' +
            'aromatic gravies. Every dish is a celebration of India\'s culinary heritage, from ' +
            'our buttery Dal Makhani (slow-cooked for 18 hours) to our signature Burrah Kebabs ' +
            'marinated in a secret blend of 25 spices.',
        shortDescription:
            'Authentic North Indian & Punjabi cuisine crafted with traditional recipes and the finest ingredients.',
        address: '42, MG Road, Indiranagar',
        city: 'Bangalore',
        latitude: 12.9716,
        longitude: 77.5946,
        phone: '+91 98765 43210',
        email: 'hello@punjabgrillhouse.com',
        website: 'https://punjabgrillhouse.com',
        cuisineType: 'North Indian, Punjabi, Mughlai',
        priceRange: '₹₹₹',
        priceForTwo: 1800,
        rating: 4.5,
        ratingCount: 1247,
        isOpen: true,
        openingHours: hoursFromString(
            '11:00 AM – 11:00 PM|11:00 AM – 11:00 PM|11:00 AM – 11:00 PM|11:00 AM – 11:00 PM|' +
            '11:00 AM – 12:00 AM|10:00 AM – 12:00 AM|10:00 AM – 10:00 PM'
        ),
        amenities: [
            'Free Wi-Fi', 'Valet Parking', 'Full Bar Available', 'Air Conditioning',
            'Family Friendly', 'Wheelchair Accessible', 'Outdoor Seating',
            'Private Dining Room', 'Live Music (Weekends)', 'Home Delivery',
        ],
        offers: '20% off on first order • Free dessert on birthdays 🎉',
        reviews: [
            {
                id: 'r1', user: 'Ananya Sharma', avatar: 'https://picsum.photos/seed/r1-avatar/100/100', rating: 5, date: '2026-06-25',
                comment: 'Absolutely divine! The Burrah Kebabs were the best I have ever had — perfectly marinated and cooked to perfection in the tandoor. The Dal Makhani was incredibly rich and creamy.'
            },
            {
                id: 'r2', user: 'Rahul Verma', avatar: 'https://picsum.photos/seed/r2-avatar/100/100', rating: 4, date: '2026-06-20',
                comment: 'Great ambience and wonderful food. The butter chicken was flavourful and the naan was perfectly crisp. Slightly expensive but the quality justifies the price.'
            },
            {
                id: 'r3', user: 'Priya Kapoor', avatar: 'https://picsum.photos/seed/r3-avatar/100/100', rating: 5, date: '2026-06-15',
                comment: 'Hands down the best restaurant in Indiranagar! The staff is incredibly hospitable, the live music on Saturday nights creates such a vibrant atmosphere, and the food — oh the food!'
            },
            {
                id: 'r4', user: 'Vikram Patel', avatar: 'https://picsum.photos/seed/r4-avatar/100/100', rating: 4, date: '2026-06-10',
                comment: 'Ordered takeaway for a family dinner and everything arrived hot and fresh. The packaging was excellent — no spills at all. Portions are generous.'
            },
            {
                id: 'r5', user: 'Neha Gupta', avatar: 'https://picsum.photos/seed/r5-avatar/100/100', rating: 5, date: '2026-05-28',
                comment: 'The Sunday brunch buffet is incredible value. So many options — from chaat counters to live tandoors to an extensive dessert spread.'
            },
            {
                id: 'r6', user: 'Arjun Singh', avatar: 'https://picsum.photos/seed/r6-avatar/100/100', rating: 3, date: '2026-05-20',
                comment: 'Good food but the wait time on weekends can be frustrating (45+ minutes even with a reservation). The food quality is consistently excellent though.'
            },
        ],
        reviewStats: { 5: 712, 4: 340, 3: 120, 2: 50, 1: 25 },
    },
    {
        id: 'rest-002',
        name: 'Madras Cafe',
        coverImage: COVERS['rest-002'],
        logoUrl: LOGOS['rest-002'],
        photos: GALLERIES['rest-002'],
        description:
            'Madras Cafe is your go-to destination for authentic South Indian cuisine. ' +
            'From crispy golden dosas to fluffy idlis and aromatic filter coffee, every item ' +
            'on our menu is crafted with traditional techniques passed down through generations. ' +
            'Our chefs bring the true taste of Tamil Nadu, Kerala, and Andhra Pradesh to your table. ' +
            'We source our spices directly from the farms of Kerala and our coffee beans from ' +
            'the hills of Chikmagalur to ensure an authentic experience in every bite and sip.',
        shortDescription:
            'Traditional South Indian fare — dosas, idlis, vadas, and the finest filter coffee in town.',
        address: '15, Church Street, Shivajinagar',
        city: 'Bangalore',
        latitude: 12.9833,
        longitude: 77.6139,
        phone: '+91 98765 43211',
        email: 'hello@madrascafe.com',
        website: 'https://madrascafe.com',
        cuisineType: 'South Indian, Kerala, Andhra',
        priceRange: '₹₹',
        priceForTwo: 600,
        rating: 4.3,
        ratingCount: 876,
        isOpen: true,
        openingHours: hoursFromString(
            '7:00 AM – 10:30 PM|7:00 AM – 10:30 PM|7:00 AM – 10:30 PM|7:00 AM – 10:30 PM|' +
            '7:00 AM – 11:00 PM|7:00 AM – 11:00 PM|8:00 AM – 10:00 PM'
        ),
        amenities: [
            'Free Wi-Fi', 'Street Parking', 'Air Conditioning', 'Family Friendly',
            'Wheelchair Accessible', 'Vegetarian Friendly', 'Takeaway Available',
        ],
        offers: 'Combo meal at ₹199 • Free coffee on weekdays before 9 AM ☕',
        reviews: [
            {
                id: 'r7', user: 'Suresh Iyer', avatar: 'https://picsum.photos/seed/r7-avatar/100/100', rating: 5, date: '2026-06-28',
                comment: 'The ghee roast dosa is a masterpiece! Crispy, golden, and perfectly spiced potato filling. The sambhar is the best I have had outside of Tamil Nadu.'
            },
            {
                id: 'r8', user: 'Lakshmi Nair', avatar: 'https://picsum.photos/seed/r8-avatar/100/100', rating: 4, date: '2026-06-22',
                comment: 'Excellent filter coffee — strong, frothy, and served in the traditional steel tumbler. The Kerala parotta and veg stew combination is also amazing.'
            },
            {
                id: 'r9', user: 'Rohan Mehta', avatar: 'https://picsum.photos/seed/r9-avatar/100/100', rating: 4, date: '2026-06-18',
                comment: 'Great breakfast spot! The unlimited South Indian thali on Sundays is fantastic value at just ₹299. Will definitely come back.'
            },
        ],
        reviewStats: { 5: 421, 4: 298, 3: 95, 2: 42, 1: 20 },
    },
    {
        id: 'rest-003',
        name: 'Dragon Wok',
        coverImage: COVERS['rest-003'],
        logoUrl: LOGOS['rest-003'],
        photos: GALLERIES['rest-003'],
        description:
            'Dragon Wok serves authentic Indo-Chinese cuisine with a modern twist. ' +
            'Our chefs have mastered the art of balancing bold flavours — from the fiery ' +
            'heat of Szechuan peppers to the tangy sweetness of our signature sauces. ' +
            'We use only the freshest vegetables, premium meats, and imported Asian condiments ' +
            'to create dishes that are both familiar and exciting. Whether you crave classic ' +
            'Gobi Manchurian or want to try our chef\'s special Dragon Noodles, every dish ' +
            'is wok-tossed to perfection at high heat to lock in flavour and texture.',
        shortDescription:
            'Bold Indo-Chinese flavours — sizzling noodles, Manchurian, and chef-special dragon rolls.',
        address: '78, 100 Feet Road, Koramangala',
        city: 'Bangalore',
        latitude: 12.9352,
        longitude: 77.6245,
        phone: '+91 98765 43212',
        email: 'orders@dragonwok.in',
        website: 'https://dragonwok.in',
        cuisineType: 'Chinese, Indo-Chinese, Thai',
        priceRange: '₹₹',
        priceForTwo: 850,
        rating: 4.1,
        ratingCount: 654,
        isOpen: true,
        openingHours: hoursFromString(
            '12:00 PM – 11:00 PM|12:00 PM – 11:00 PM|12:00 PM – 11:00 PM|12:00 PM – 11:00 PM|' +
            '12:00 PM – 12:00 AM|12:00 PM – 12:00 AM|1:00 PM – 10:30 PM'
        ),
        amenities: [
            'Free Wi-Fi', 'Valet Parking', 'Air Conditioning', 'Full Bar Available',
            'Family Friendly', 'Home Delivery', 'Outdoor Seating',
        ],
        offers: 'Buy 1 Get 1 on appetisers (Mon–Thu) • 15% off on takeaway orders above ₹500 🥟',
        reviews: [
            {
                id: 'r10', user: 'Karan Joshi', avatar: 'https://picsum.photos/seed/r10-avatar/100/100', rating: 5, date: '2026-06-26',
                comment: 'The chilli chicken here is legendary! Perfectly crispy, succulent, and tossed in a sauce that hits all the right notes — spicy, tangy, and slightly sweet.'
            },
            {
                id: 'r11', user: 'Maya Desai', avatar: 'https://picsum.photos/seed/r11-avatar/100/100', rating: 4, date: '2026-06-19',
                comment: 'Dragon Noodles are a must-try! The smoky wok flavour really comes through. The portion sizes are generous too. Great for a group dinner.'
            },
            {
                id: 'r12', user: 'Amit Rao', avatar: 'https://picsum.photos/seed/r12-avatar/100/100', rating: 3, date: '2026-06-12',
                comment: 'Decent Indo-Chinese food. The Manchow soup was good but the fried rice was a bit oily for my taste. Service is quick though.'
            },
        ],
        reviewStats: { 5: 302, 4: 210, 3: 88, 2: 35, 1: 19 },
    },
    {
        id: 'rest-004',
        name: 'La Piazza',
        coverImage: COVERS['rest-004'],
        logoUrl: LOGOS['rest-004'],
        photos: GALLERIES['rest-004'],
        description:
            'La Piazza brings the warmth and charm of Italy to the heart of Bangalore. ' +
            'Our wood-fired pizzas are made with imported Italian flour, San Marzano tomatoes, ' +
            'and fresh buffalo mozzarella. Our pasta is hand-rolled daily, and our desserts — ' +
            'from classic Tiramisu to Panna Cotta — are crafted by our pastry chef who trained ' +
            'in Milan. Every dish at La Piazza tells a story of tradition, passion, and the ' +
            'simple joy of sharing good food with loved ones. Pair your meal with a selection ' +
            'from our carefully curated wine list featuring Italian and Indian labels.',
        shortDescription:
            'Wood-fired pizzas, hand-rolled pasta, and authentic Italian desserts in a romantic setting.',
        address: '55, Lavelle Road, Ashok Nagar',
        city: 'Bangalore',
        latitude: 12.9720,
        longitude: 77.6033,
        phone: '+91 98765 43213',
        email: 'ciao@lapiazza.in',
        website: 'https://lapiazza.in',
        cuisineType: 'Italian, Continental, Mediterranean',
        priceRange: '₹₹₹₹',
        priceForTwo: 2800,
        rating: 4.6,
        ratingCount: 523,
        isOpen: false,
        openingHours: hoursFromString(
            'Closed|6:00 PM – 11:00 PM|6:00 PM – 11:00 PM|6:00 PM – 11:00 PM|' +
            '6:00 PM – 11:30 PM|12:00 PM – 11:30 PM|12:00 PM – 10:30 PM'
        ),
        amenities: [
            'Free Wi-Fi', 'Valet Parking', 'Full Bar Available', 'Air Conditioning',
            'Wheelchair Accessible', 'Outdoor Seating', 'Private Dining Room',
            'Romantic Ambience', 'Wine Collection',
        ],
        offers: '20% off on wine bottles (Wednesdays) • Free dessert for couples on date night 💕',
        reviews: [
            {
                id: 'r13', user: 'Isha Mehta', avatar: 'https://picsum.photos/seed/r13-avatar/100/100', rating: 5, date: '2026-06-27',
                comment: 'The most authentic Italian food in Bangalore! The Quattro Formaggi pizza is divine, and the Tiramisu is the best I have had outside of Italy.'
            },
            {
                id: 'r14', user: 'David D\'Souza', avatar: 'https://picsum.photos/seed/r14-avatar/100/100', rating: 5, date: '2026-06-21',
                comment: 'Perfect date night spot. The ambience is romantic, the service is impeccable, and the food is world-class. Highly recommend the truffle mushroom risotto.'
            },
            {
                id: 'r15', user: 'Natasha Singh', avatar: 'https://picsum.photos/seed/r15-avatar/100/100', rating: 4, date: '2026-06-14',
                comment: 'Lovely place for a special occasion. The pasta is freshly made and you can really taste the difference. Reservations are a must on weekends.'
            },
        ],
        reviewStats: { 5: 341, 4: 132, 3: 35, 2: 10, 1: 5 },
    },
    {
        id: 'rest-005',
        name: 'Sushi Ko',
        coverImage: COVERS['rest-005'],
        logoUrl: LOGOS['rest-005'],
        photos: GALLERIES['rest-005'],
        description:
            'Sushi Ko is Bangalore\'s premier destination for authentic Japanese cuisine. ' +
            'Our master chef, trained in Tokyo for over a decade, brings an unwavering commitment ' +
            'to the art of Edomae-style sushi. Every piece of fish is carefully selected from ' +
            'the freshest catches, flown in daily. From delicate sashimi to perfectly vinegared ' +
            'sushi rice, every detail matters. Beyond sushi, our menu features traditional ' +
            'Japanese dishes — ramen, tempura, yakitori, and donburi — each prepared with ' +
            'authentic techniques and premium imported ingredients.',
        shortDescription:
            'Premium Japanese dining — Edomae sushi, sashimi, ramen, and robata grill specialties.',
        address: '21, MG Road, Ashok Nagar',
        city: 'Bangalore',
        latitude: 12.9745,
        longitude: 77.6065,
        phone: '+91 98765 43214',
        email: 'reservations@sushiko.com',
        website: 'https://sushiko.com',
        cuisineType: 'Japanese, Sushi, Ramen',
        priceRange: '₹₹₹₹',
        priceForTwo: 3500,
        rating: 4.7,
        ratingCount: 389,
        isOpen: true,
        openingHours: hoursFromString(
            '12:00 PM – 3:00 PM, 7:00 PM – 11:00 PM|12:00 PM – 3:00 PM, 7:00 PM – 11:00 PM|' +
            '12:00 PM – 3:00 PM, 7:00 PM – 11:00 PM|12:00 PM – 3:00 PM, 7:00 PM – 11:00 PM|' +
            '12:00 PM – 3:00 PM, 7:00 PM – 11:30 PM|12:00 PM – 11:30 PM|12:00 PM – 10:00 PM'
        ),
        amenities: [
            'Free Wi-Fi', 'Valet Parking', 'Full Bar Available', 'Sake Selection',
            'Air Conditioning', 'Private Dining Room', 'Teppanyaki Counter',
            'Wheelchair Accessible', 'Omakase Experience',
        ],
        offers: 'Happy Hour (4–7 PM): 30% off on sake & selected rolls 🍣',
        reviews: [
            {
                id: 'r16', user: 'Aarav Khanna', avatar: 'https://picsum.photos/seed/r16-avatar/100/100', rating: 5, date: '2026-06-29',
                comment: 'The Omakase experience at Sushi Ko is unparalleled in Bangalore. Each piece of sushi was a work of art. The fatty tuna (otoro) literally melted in my mouth.'
            },
            {
                id: 'r17', user: 'Sophia Lee', avatar: 'https://picsum.photos/seed/r17-avatar/100/100', rating: 5, date: '2026-06-23',
                comment: 'Finally, authentic Japanese cuisine in Bangalore! The Tonkotsu ramen broth is rich and flavourful — simmered for 18 hours as tradition demands.'
            },
        ],
        reviewStats: { 5: 301, 4: 68, 3: 15, 2: 3, 1: 2 },
    },
    {
        id: 'rest-006',
        name: 'Biryani Central',
        coverImage: COVERS['rest-006'],
        logoUrl: LOGOS['rest-006'],
        photos: GALLERIES['rest-006'],
        description:
            'Biryani Central is a haven for biryani lovers. We specialise in regional biryani ' +
            'styles from across India — the fragrant Hyderabadi Dum Biryani, the delicate ' +
            'Lucknowi Awadhi Biryani, the spicy Kolkata Biryani, and our own Chef\'s Special ' +
            'that combines the best of all worlds. Each biryani is slow-cooked in a sealed ' +
            'handi (clay pot) to trap all the aromas and flavours. We use aged Basmati rice ' +
            'from the Himalayan foothills, premium spices sourced directly from the markets ' +
            'of Hyderabad, and the freshest meat and vegetables.',
        shortDescription:
            'India\'s finest biryanis — Hyderabadi, Lucknowi, Kolkata styles — slow-cooked in clay pots.',
        address: '33, Brigade Road, Ashok Nagar',
        city: 'Bangalore',
        latitude: 12.9698,
        longitude: 77.6100,
        phone: '+91 98765 43215',
        email: 'hello@biryani-central.com',
        website: 'https://biryani-central.com',
        cuisineType: 'Mughlai, Hyderabadi, Awadhi',
        priceRange: '₹₹',
        priceForTwo: 700,
        rating: 4.2,
        ratingCount: 1892,
        isOpen: true,
        openingHours: hoursFromString(
            '11:00 AM – 10:30 PM|11:00 AM – 10:30 PM|11:00 AM – 10:30 PM|11:00 AM – 10:30 PM|' +
            '11:00 AM – 11:30 PM|11:00 AM – 11:30 PM|11:00 AM – 10:00 PM'
        ),
        amenities: [
            'Free Wi-Fi', 'Parking Available', 'Air Conditioning', 'Family Friendly',
            'Home Delivery', 'Takeaway Available', 'Large Groups Welcome',
        ],
        offers: 'Buy 2 Biryanis Get 1 Free (Weekdays) • Free Raita & Salad with every biryani 🍚',
        reviews: [
            {
                id: 'r18', user: 'Zakir Hussain', avatar: 'https://picsum.photos/seed/r18-avatar/100/100', rating: 5, date: '2026-06-24',
                comment: 'The Hyderabadi Dum Biryani is the real deal! Fragrant rice, tender meat, and just the right amount of spices. The mirchi ka salan on the side is perfect.'
            },
            {
                id: 'r19', user: 'Fatima Ahmed', avatar: 'https://picsum.photos/seed/r19-avatar/100/100', rating: 4, date: '2026-06-17',
                comment: 'Love that they offer multiple regional styles. The Lucknowi biryani is subtle and elegant, while the Kolkata version has a lovely potato twist.'
            },
            {
                id: 'r20', user: 'Ravi Shankar', avatar: 'https://picsum.photos/seed/r20-avatar/100/100', rating: 4, date: '2026-06-08',
                comment: 'Great value for money. The family biryani pack easily serves 4 and costs just ₹599. Perfect for a weekend dinner at home.'
            },
        ],
        reviewStats: { 5: 890, 4: 652, 3: 215, 2: 85, 1: 50 },
    },
    {
        id: 'rest-007',
        name: 'Green Bowl',
        coverImage: COVERS['rest-007'],
        logoUrl: LOGOS['rest-007'],
        photos: GALLERIES['rest-007'],
        description:
            'Green Bowl is Bangalore\'s favourite healthy eating destination. We believe that ' +
            'healthy food should never compromise on taste. Our menu features a vibrant array ' +
            'of salads, grain bowls, smoothies, and plant-based comfort food — all made from ' +
            'scratch using organic, locally sourced ingredients. Whether you are vegan, ' +
            'gluten-free, or just looking for a nutritious meal that actually tastes amazing, ' +
            'Green Bowl has something for you. Every calorie counts, and we make sure each ' +
            'one is packed with flavour and nutrition.',
        shortDescription:
            'Organic salads, grain bowls, smoothies & plant-based comfort food — healthy never tasted this good.',
        address: '9, Indiranagar Double Road',
        city: 'Bangalore',
        latitude: 12.9784,
        longitude: 77.6408,
        phone: '+91 98765 43216',
        email: 'hello@greenbowl.in',
        website: 'https://greenbowl.in',
        cuisineType: 'Healthy, Salad, Vegan, Continental',
        priceRange: '₹₹',
        priceForTwo: 900,
        rating: 4.4,
        ratingCount: 412,
        isOpen: false,
        openingHours: hoursFromString(
            '8:00 AM – 9:30 PM|8:00 AM – 9:30 PM|8:00 AM – 9:30 PM|8:00 AM – 9:30 PM|' +
            '8:00 AM – 10:00 PM|9:00 AM – 10:00 PM|9:00 AM – 9:00 PM'
        ),
        amenities: [
            'Free Wi-Fi', 'Street Parking', 'Air Conditioning', 'Pet Friendly',
            'Vegan Friendly', 'Gluten-Free Options', 'Outdoor Seating', 'Organic Ingredients',
        ],
        offers: 'Loyalty card: 10th bowl free • 20% off for students with ID 🥗',
        reviews: [
            {
                id: 'r21', user: 'Divya Patel', avatar: 'https://picsum.photos/seed/r21-avatar/100/100', rating: 5, date: '2026-06-26',
                comment: 'Finally, a healthy restaurant that gets it right! The Buddha Bowl is absolutely delicious — quinoa, roasted sweet potato, avocado, and the most amazing tahini dressing.'
            },
            {
                id: 'r22', user: 'Michael D\'Costa', avatar: 'https://picsum.photos/seed/r22-avatar/100/100', rating: 4, date: '2026-06-16',
                comment: 'Great post-workout meal spot. The protein smoothie bowls are fantastic and the portions are filling. Slightly pricey but worth it for the quality.'
            },
        ],
        reviewStats: { 5: 238, 4: 126, 3: 32, 2: 10, 1: 6 },
    },
    {
        id: 'rest-008',
        name: 'Tandoori Nights',
        coverImage: COVERS['rest-008'],
        logoUrl: LOGOS['rest-008'],
        photos: GALLERIES['rest-008'],
        description:
            'Tandoori Nights is where the ancient art of tandoor cooking meets modern ' +
            'gastronomy. Our signature clay ovens, fired with charcoal, reach temperatures ' +
            'of up to 480°C, giving our kebabs, breads, and grilled dishes their distinctive ' +
            'smoky char and juicy tenderness. Our menu spans the length and breadth of India\'s ' +
            'tandoor traditions — from the robust Seekh Kebabs of the North West Frontier to ' +
            'the seafood specialties of coastal Maharashtra. Each dish is paired with our ' +
            'house-made chutneys and pickles that add bursts of flavour.',
        shortDescription:
            'Premium tandoori kebabs, grilled seafood, and freshly baked breads from the clay oven.',
        address: '66, Commercial Street, Shivajinagar',
        city: 'Bangalore',
        latitude: 12.9825,
        longitude: 77.6078,
        phone: '+91 98765 43217',
        email: 'info@tandoorinights.com',
        website: 'https://tandoorinights.com',
        cuisineType: 'North Indian, Tandoori, Frontier',
        priceRange: '₹₹₹',
        priceForTwo: 1500,
        rating: 4.0,
        ratingCount: 978,
        isOpen: true,
        openingHours: hoursFromString(
            '7:00 PM – 11:30 PM|7:00 PM – 11:30 PM|7:00 PM – 11:30 PM|7:00 PM – 11:30 PM|' +
            '7:00 PM – 12:30 AM|7:00 PM – 12:30 AM|7:00 PM – 11:00 PM'
        ),
        amenities: [
            'Free Wi-Fi', 'Valet Parking', 'Full Bar Available', 'Air Conditioning',
            'Family Friendly', 'Wheelchair Accessible', 'Outdoor Seating', 'Live Music',
        ],
        offers: '20% off on all kebabs (Monday nights) • Complimentary dessert for group bookings of 6+ 🍢',
        reviews: [
            {
                id: 'r23', user: 'Gurpreet Singh', avatar: 'https://picsum.photos/seed/r23-avatar/100/100', rating: 5, date: '2026-06-27',
                comment: 'The tandoori prawns are absolutely incredible! Perfectly charred, juicy, and marinated in a flavourful spice mix. Best tandoori food in Bangalore hands down.'
            },
            {
                id: 'r24', user: 'Pooja Reddy', avatar: 'https://picsum.photos/seed/r24-avatar/100/100', rating: 4, date: '2026-06-13',
                comment: 'Love the ambience — the open kitchen with the visible tandoor adds to the experience. The garlic naan is the best I have ever had, so soft and buttery.'
            },
        ],
        reviewStats: { 5: 412, 4: 340, 3: 142, 2: 55, 1: 29 },
    },
]

// ─── Build summaries from details ────────────────────────────────────────

const SUMMARIES: RestaurantSummary[] = DETAILS.map((d) => ({
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    address: d.address,
    city: d.city,
    cuisine_type: d.cuisineType,
    logo_url: d.logoUrl,
    latitude: d.latitude,
    longitude: d.longitude,
    distance_km: null, // will be calculated client-side when geolocation is available
    rating: d.rating,
    rating_count: d.ratingCount,
    price_range: d.priceRange,
    price_for_two: d.priceForTwo,
    offers: d.offers,
    opening_hours: d.openingHours.map(h => `${h.day}: ${h.hours}`).join(' | '),
    is_open: d.isOpen,
}))

// ─── Exported helpers ────────────────────────────────────────────────────

/** Get a random distance between 0.3 and 15 km (for dummy geolocation) */
export function randomDistance(): number {
    return Math.round((Math.random() * 14.7 + 0.3) * 10) / 10
}

/** Assign random distances to all summaries (simulates geo-based sorting) */
export function withDistances(list: RestaurantSummary[], _lat?: number, _lng?: number): RestaurantSummary[] {
    return list.map((r) => ({
        ...r,
        distance_km: randomDistance(),
    })).sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
}

// ─── Public API ──────────────────────────────────────────────────────────

/** Get all restaurant summaries (for Nearby list page) */
export function getAllSummaries(): RestaurantSummary[] {
    return withDistances([...SUMMARIES])
}

/** Get all summaries filtered by city */
export function getSummariesByCity(city: string): RestaurantSummary[] {
    const filtered = SUMMARIES.filter(
        (r) => r.city.toLowerCase().includes(city.toLowerCase())
    )
    return withDistances(filtered)
}

/** Get a single restaurant detail by ID */
export function getDetailById(id: string): RestaurantDetail | undefined {
    return DETAILS.find((d) => d.id === id)
}

/** Get all unique cuisine tags across all restaurants */
export function getAllCuisineTags(): string[] {
    const tags = new Set<string>()
    for (const d of DETAILS) {
        d.cuisineType.split(',').map(t => t.trim()).forEach(t => tags.add(t))
    }
    return Array.from(tags)
}
