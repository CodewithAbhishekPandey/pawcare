require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Clinic = require('./models/Clinic');
const Appointment = require('./models/Appointment');
const Product = require('./models/Product');
const Order = require('./models/Order');
const ConsultSession = require('./models/ConsultSession');
const SiteSetting = require('./models/SiteSetting');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

function buildSlots() {
  const slots = [];
  for (const day of DAYS) {
    for (const time of TIMES) {
      slots.push({ day, time, isBooked: false });
    }
  }
  return slots;
}

async function seedDatabase() {
  const password = await bcrypt.hash('Password123!', 10);

  // --- Users ---
  const [admin, owner1, owner2, vet1, vet2, vet3] = await User.create([
    { name: 'PawCare Admin', email: 'admin@pawcare.in', password, role: 'admin' },
    { name: 'Riya Sharma', email: 'riya@pawcare.in', password, role: 'pet_owner', phone: '9876543210' },
    { name: 'Arjun Mehta', email: 'arjun@pawcare.in', password, role: 'pet_owner', phone: '9876543211' },
    {
      name: 'Dr. Priya Singh',
      email: 'drpriya@pawcare.in',
      password,
      role: 'vet',
      phone: '9876543212',
      specializations: ['Dogs', 'Cats', 'General Medicine'],
      consultFee: 500,
      isOnline: true,
      rating: 4.8,
      totalRatings: 42,
      totalEarnings: 21000,
    },
    {
      name: 'Dr. Rahul Gupta',
      email: 'drrahul@pawcare.in',
      password,
      role: 'vet',
      phone: '9876543213',
      specializations: ['Exotic Animals', 'Birds', 'Reptiles'],
      consultFee: 800,
      isOnline: true,
      rating: 4.9,
      totalRatings: 67,
      totalEarnings: 53600,
    },
    {
      name: 'Dr. Ananya Kapoor',
      email: 'drananya@pawcare.in',
      password,
      role: 'vet',
      phone: '9876543214',
      specializations: ['Cats', 'Rabbits', 'Surgery'],
      consultFee: 1000,
      isOnline: false,
      rating: 5.0,
      totalRatings: 28,
      totalEarnings: 28000,
    }
  ]);

  // --- Clinics (Gurugram GeoJSON: [lng, lat]) ---
  const [clinic1, clinic2, clinic3] = await Clinic.create([
    {
      name: 'PawCare DLF Clinic',
      ownerRef: vet1._id,
      address: 'DLF Phase 2, Sector 25, Gurugram, Haryana 122002',
      location: { type: 'Point', coordinates: [77.0880, 28.4749] },
      specializations: ['dogs', 'cats'],
      availableSlots: buildSlots(),
      timings: { open: '09:00', close: '17:00' },
      isVerified: true
    },
    {
      name: 'Sector 56 Pet Hospital',
      ownerRef: vet2._id,
      address: 'Sector 56, Gurugram, Haryana 122011',
      location: { type: 'Point', coordinates: [77.1025, 28.4255] },
      specializations: ['cats', 'exotic'],
      availableSlots: buildSlots(),
      timings: { open: '09:00', close: '18:00' },
      isVerified: true
    },
    {
      name: 'Golf Course Vet Centre',
      ownerRef: vet1._id,
      address: 'Golf Course Road, Sector 42, Gurugram, Haryana 122002',
      location: { type: 'Point', coordinates: [77.1022, 28.4626] },
      specializations: ['dogs', 'birds'],
      availableSlots: buildSlots(),
      timings: { open: '10:00', close: '19:00' },
      isVerified: true
    }
  ]);

  // --- Products (20 items) ---
  await Product.create([
    // Food (5)
    { name: 'Royal Canin Adult Dog 3kg', category: 'food', price: 1200, description: 'Premium dry food for adult dogs, rich in protein and omega-3', brand: 'Royal Canin', stock: 50 },
    { name: 'Pedigree Puppy Wet Food', category: 'food', price: 350, description: 'Soft wet food for puppies, chicken & rice flavour', brand: 'Pedigree', stock: 50 },
    { name: 'Whiskas Cat Food 1.2kg', category: 'food', price: 500, description: 'Balanced nutrition for adult cats with real fish', brand: 'Whiskas', stock: 50 },
    { name: 'Drools Focus Adult Dog', category: 'food', price: 800, description: 'Super premium dog food enriched with omega-3', brand: 'Drools', stock: 50 },
    { name: 'Me-O Persian Cat Food', category: 'food', price: 650, description: 'Specially formulated for Persian breed cats', brand: 'Me-O', stock: 50 },

    // Medicine (5)
    { name: 'Bayer Tick & Flea Shampoo', category: 'medicine', price: 250, description: 'Anti-parasitic shampoo effective against ticks, fleas and lice', brand: 'Bayer', stock: 50 },
    { name: 'Virbac Deworming Tablets 6pk', category: 'medicine', price: 180, description: 'Broad-spectrum dewormer for dogs and cats', brand: 'Virbac', stock: 50 },
    { name: 'Beaphar Vitamin E Supplement', category: 'medicine', price: 320, description: 'Skin and coat health supplement for pets', brand: 'Beaphar', stock: 50 },
    { name: 'Himalaya Ear Cleaning Drops', category: 'medicine', price: 220, description: 'Gently cleans ear wax and prevents infections', brand: 'Himalaya', stock: 50 },
    { name: 'Drools Calcium Chews', category: 'medicine', price: 450, description: 'Chewable calcium supplement for bone health in dogs and cats', brand: 'Drools', stock: 50 },

    // Accessories (5)
    { name: 'Trixie Adjustable Nylon Collar', category: 'accessory', price: 200, description: 'Durable nylon collar with quick-release buckle, multiple size options', brand: 'Trixie', stock: 50 },
    { name: 'Petkit Stainless Steel Bowl Set', category: 'accessory', price: 380, description: 'Set of 2 stainless steel bowls with non-slip rubber base', brand: 'Petkit', stock: 50 },
    { name: 'Catit Sisal Scratching Post', category: 'accessory', price: 750, description: 'Sisal rope scratching post with fluffy top ball toy', brand: 'Catit', stock: 50 },
    { name: 'Flexi Retractable Dog Leash 5m', category: 'accessory', price: 550, description: '5-metre retractable leash with ergonomic rubberised handle', brand: 'Flexi', stock: 50 },
    { name: 'Airline-Approved Pet Carrier Bag', category: 'accessory', price: 1200, description: 'Soft-sided pet carrier with mesh windows, cabin-approved dimensions', brand: 'PetBasics', stock: 50 },

    // Toys (5)
    { name: 'Kong Classic Natural Rubber Bone', category: 'toy', price: 280, description: 'Natural rubber chew toy that cleans teeth and exercises jaws', brand: 'Kong', stock: 50 },
    { name: 'Catit Feather Wand Cat Toy', category: 'toy', price: 150, description: 'Interactive feather wand to stimulate natural hunting instincts', brand: 'Catit', stock: 50 },
    { name: 'Petstages Squeaky Plush Duck', category: 'toy', price: 220, description: 'Soft plush toy with squeaker inside, great for small to medium dogs', brand: 'Petstages', stock: 50 },
    { name: "Yeowww! Catnip Mouse 3pk", category: 'toy', price: 180, description: 'Pack of 3 organic catnip-filled mice that cats absolutely love', brand: "Yeowww!", stock: 50 },
    { name: 'Nina Ottosson Interactive Puzzle Feeder', category: 'toy', price: 650, description: 'Mental stimulation puzzle feeder for dogs with 3 adjustable difficulty levels', brand: 'Nina Ottosson', stock: 50 }
  ]);

  // --- Appointments (4 sample) ---
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const meetRoomId = 'pawcare_' + Date.now() + '_demo123abc';

  await Appointment.create([
    {
      petOwnerRef: owner1._id,
      clinicRef: clinic1._id,
      date: tomorrow,
      timeSlot: '10:00',
      status: 'pending',
      type: 'in_person',
      petName: 'Bruno',
      petType: 'Dog',
      notes: 'Annual vaccination checkup'
    },
    {
      petOwnerRef: owner1._id,
      clinicRef: clinic2._id,
      date: nextWeek,
      timeSlot: '11:00',
      status: 'confirmed',
      type: 'scheduled_online',
      meetRoomId,
      meetLink: `/video/${meetRoomId}`,
      petName: 'Whiskers',
      petType: 'Cat',
      notes: 'Dental cleaning consultation (video)'
    },
    {
      petOwnerRef: owner2._id,
      clinicRef: clinic3._id,
      date: yesterday,
      timeSlot: '14:00',
      status: 'completed',
      type: 'in_person',
      petName: 'Coco',
      petType: 'Dog',
      notes: 'Follow-up on skin allergy treatment'
    },
    {
      petOwnerRef: owner2._id,
      clinicRef: clinic1._id,
      date: yesterday,
      timeSlot: '09:00',
      status: 'cancelled',
      type: 'in_person',
      petName: 'Polly',
      petType: 'Bird',
      notes: 'Wing clipping cancelled due to travel'
    }
  ]);

  // --- Sample ConsultSessions ---
  await ConsultSession.create([
    {
      petOwnerRef: owner1._id,
      vetRef: vet1._id,
      status: 'completed',
      petName: 'Bruno',
      petType: 'Dog',
      issue: 'Dog is scratching a lot, possible allergy',
      meetRoomId: 'pawcare_sample_room_001',
      fee: 500,
      paymentStatus: 'paid',
      duration: 12,
      ownerRating: 5,
      ownerReview: 'Excellent consultation! Dr. Priya was very helpful.',
    },
    {
      petOwnerRef: owner2._id,
      vetRef: vet2._id,
      status: 'completed',
      petName: 'Tweety',
      petType: 'Bird',
      issue: 'Bird not eating well for 2 days',
      meetRoomId: 'pawcare_sample_room_002',
      fee: 800,
      paymentStatus: 'paid',
      duration: 18,
      ownerRating: 4,
      ownerReview: 'Very knowledgeable about exotic animals.',
    }
  ]);

  // --- Site Settings ---
  await SiteSetting.create([
    { key:'platform_fee_percent', value:0, label:'Platform fee %', type:'number' },
    { key:'consult_enabled', value:true, label:'Instant consult feature on/off', type:'boolean' },
    { key:'marketplace_enabled', value:true, label:'Shop/marketplace on/off', type:'boolean' },
    { key:'featured_vet_ids', value:[], label:'Featured vet IDs (shown on homepage)', type:'json' },
    { key:'homepage_banner_text', value:'Gurugram\'s most trusted pet care platform', label:'Homepage banner text', type:'text' },
    { key:'homepage_banner_subtext', value:'Find vets, book appointments, shop essentials', label:'Homepage banner subtext', type:'text' },
    { key:'max_consult_wait_minutes', value:5, label:'Auto-cancel consult after X minutes', type:'number' },
    { key:'min_consult_fee', value:100, label:'Minimum consult fee vets can set (₹)', type:'number' }
  ]);

  console.log('🎉 Database seeded successfully!');
  console.log('\nTest credentials (password: Password123!):');
  console.log('  Admin: admin@pawcare.in');
  console.log('  Pet Owner 1: riya@pawcare.in');
  console.log('  Pet Owner 2: arjun@pawcare.in');
  console.log('  Vet 1 (Online, ₹500): drpriya@pawcare.in');
  console.log('  Vet 2 (Online, ₹800): drrahul@pawcare.in');
  console.log('  Vet 3 (Offline, ₹1000): drananya@pawcare.in');
}

// Export for use in index.js auto-seed
module.exports = { seedDatabase };

// Run directly: node seed.js
if (require.main === module) {
  (async () => {
    try {
      let mongoUri = process.env.MONGO_URI;
      if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
        console.log('⚠️  No external MongoDB. Using in-memory (data will not persist!)');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
      }
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');

      await User.deleteMany({});
      await Clinic.deleteMany({});
      await Appointment.deleteMany({});
      await Product.deleteMany({});
      await Order.deleteMany({});
      await ConsultSession.deleteMany({});
      await SiteSetting.deleteMany({});

      await seedDatabase();
      await mongoose.disconnect();
      console.log('\nSeeded successfully!');
      process.exit(0);
    } catch (err) {
      console.error('Seed error:', err.message);
      process.exit(1);
    }
  })();
}
