require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const vetRoutes = require('./routes/vetRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const consultRoutes = require('./routes/consult.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach socket handlers
const initConsultQueue = require('./socket/consultQueue');
initConsultQueue(io);

// Make io accessible in routes/controllers if needed
app.set('io', io);

// ─── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/vets', vetRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/consult', consultRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/settings/public', (req, res) => {
  const publicKeys = [
    'homepage_banner_text',
    'homepage_banner_subtext',
    'consult_enabled',
    'marketplace_enabled',
  ];
  const result = {};
  if (global.siteSettings) {
    publicKeys.forEach(key => {
      if (global.siteSettings[key] !== undefined) {
        result[key] = global.siteSettings[key];
      }
    });
  }
  res.json({ success: true, data: result });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PawCare API is up and running 🐾', timestamp: new Date() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Use in-memory MongoDB if no real URI is configured
    const useInMemory = !mongoUri
      || mongoUri.trim() === ''
      || mongoUri.includes('127.0.0.1')
      || mongoUri.includes('localhost');

    if (useInMemory) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      // Required for Render (Debian 12) — MongoDB 7.0.14
      if (!process.env.MONGOMS_VERSION) {
        process.env.MONGOMS_VERSION = '7.0.14';
      }
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('⚡ Using In-Memory MongoDB (will auto-seed)');
    } else {
      console.log('🌍 Using external MongoDB (Atlas / production)');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Auto-seed if database is empty
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 Empty database detected — auto-seeding...');
      const { seedDatabase } = require('./seed');
      await seedDatabase();
      console.log('✅ Auto-seed complete');
    }

    // Load SiteSettings into global cache
    const SiteSetting = require('./models/SiteSetting');
    const settings = await SiteSetting.find().lean();
    global.siteSettings = {};
    settings.forEach(s => {
      global.siteSettings[s.key] = s.value;
    });
    console.log('⚙️  Site settings loaded into cache');

    httpServer.listen(PORT, () => {
      console.log(`🚀 PawCare server running on port ${PORT}`);
      console.log(`🔌 Socket.io ready`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
}

startServer();
