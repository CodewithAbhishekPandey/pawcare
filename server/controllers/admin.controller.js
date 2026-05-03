const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const ConsultSession = require('../models/ConsultSession');
const SiteSetting = require('../models/SiteSetting');
const DeliveryAgent = require('../models/DeliveryAgent');
const emailService = require('../utils/emailService');

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalVets,
      totalOrdersThisMonth,
      revenueAgg,
      pendingVetApprovals,
      activeConsults,
      lowStockProducts,
      appointmentsByDay,
      ordersByDay,
      appointmentTypeCounts,
      recentUsers,
      recentVetApps,
      recentOrders,
      recentConsults,
    ] = await Promise.all([
      User.countDocuments({ role: 'pet_owner', isDeleted: { $ne: true } }),
      User.countDocuments({ role: 'vet', isDeleted: { $ne: true } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      ConsultSession.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$fee' } } },
      ]),
      User.countDocuments({ role: 'vet', isDeleted: { $ne: true }, isSuspended: { $ne: true } })
        .then(async () => {
          // Count clinics that are not verified (pending approval)
          return Clinic.countDocuments({ isVerified: false, isDeleted: { $ne: true } });
        }),
      ConsultSession.countDocuments({ status: 'in_call' }),
      Product.countDocuments({ stock: { $lt: 5 }, isDeleted: { $ne: true } }),
      // Appointments per day (last 14 days)
      Appointment.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Orders per day (last 14 days)
      Order.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Appointment type distribution
      Appointment.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]),
      // Recent users (last 10)
      User.find({ role: 'pet_owner' }).sort({ createdAt: -1 }).limit(5).select('name createdAt').lean(),
      // Recent vet applications
      User.find({ role: 'vet' }).sort({ createdAt: -1 }).limit(3).select('name createdAt').lean(),
      // Recent orders
      Order.find().sort({ createdAt: -1 }).limit(5).select('total status createdAt').populate('userRef', 'name').lean(),
      // Recent consults
      ConsultSession.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(3).select('fee status createdAt').populate('petOwnerRef', 'name').lean(),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Build recent activity feed
    const activities = [];
    recentUsers.forEach(u => activities.push({ type: 'user_registered', text: `${u.name} registered`, timestamp: u.createdAt }));
    recentVetApps.forEach(v => activities.push({ type: 'vet_applied', text: `Dr. ${v.name} applied as vet`, timestamp: v.createdAt }));
    recentOrders.forEach(o => activities.push({ type: 'order_placed', text: `Order ₹${o.total} by ${o.userRef?.name || 'User'}`, timestamp: o.createdAt }));
    recentConsults.forEach(c => activities.push({ type: 'consult_completed', text: `Consult ₹${c.fee} completed for ${c.petOwnerRef?.name || 'User'}`, timestamp: c.createdAt }));
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Consult session count for pie chart
    const consultSessionCount = await ConsultSession.countDocuments();

    const typeData = appointmentTypeCounts.map(t => ({ name: t._id || 'unknown', value: t.count }));
    if (consultSessionCount > 0) {
      typeData.push({ name: 'consult_sessions', value: consultSessionCount });
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalVets,
        totalOrdersThisMonth,
        totalRevenue,
        pendingVetApprovals,
        activeConsults,
        lowStockProducts,
        appointmentsByDay: appointmentsByDay.map(d => ({ date: d._id, count: d.count })),
        ordersByDay: ordersByDay.map(d => ({ date: d._id, count: d.count })),
        appointmentTypes: typeData,
        recentActivity: activities.slice(0, 10),
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VETS ───────────────────────────────────────────────────────────────────

exports.getAllVets = async (req, res) => {
  try {
    const vets = await User.find({ role: 'vet', isDeleted: { $ne: true } })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Attach clinic info
    const vetIds = vets.map(v => v._id);
    const clinics = await Clinic.find({ ownerRef: { $in: vetIds }, isDeleted: { $ne: true } }).lean();
    const clinicMap = {};
    clinics.forEach(c => { clinicMap[c.ownerRef.toString()] = c; });

    const result = vets.map(v => ({
      ...v,
      clinic: clinicMap[v._id.toString()] || null,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addVet = async (req, res) => {
  try {
    const {
      name, email, password, phone, consultFee,
      clinicName, address, latitude, longitude,
      specializations, openTime, closeTime, slotInterval, isVerified,
      availableSlots,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'vet',
      phone: phone || '',
      specializations: specializations || [],
      consultFee: consultFee || 0,
    });

    // Generate slots if not provided
    let slots = availableSlots || [];
    if (slots.length === 0 && openTime && closeTime && slotInterval) {
      slots = generateSlots(openTime, closeTime, parseInt(slotInterval));
    }

    const clinic = await Clinic.create({
      name: clinicName || `${name}'s Clinic`,
      ownerRef: user._id,
      address: address || '',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
      specializations: specializations || [],
      availableSlots: slots,
      timings: { open: openTime || '09:00', close: closeTime || '17:00' },
      isVerified: isVerified !== undefined ? isVerified : true,
    });

    res.status(201).json({ success: true, data: { user: { ...user.toObject(), password: undefined }, clinic } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function generateSlots(openTime, closeTime, intervalMinutes) {
  const slots = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const startMin = openH * 60 + openM;
  const endMin = closeH * 60 + closeM;

  for (const day of days) {
    for (let m = startMin; m + intervalMinutes <= endMin; m += intervalMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push({
        day,
        time: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        isBooked: false,
      });
    }
  }
  return slots;
}

exports.approveVet = async (req, res) => {
  try {
    const { id } = req.params;
    await Clinic.updateMany({ ownerRef: id }, { isVerified: true });
    const user = await User.findByIdAndUpdate(id, { isSuspended: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Vet not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.suspendVet = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Vet not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.restoreVet = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Vet not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteVet = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Vet not found' });
    // Soft delete associated clinics
    await Clinic.updateMany({ ownerRef: req.params.id }, { isDeleted: true });
    res.json({ success: true, message: 'Vet soft-deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CLINICS ────────────────────────────────────────────────────────────────

exports.getAllClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find({ isDeleted: { $ne: true } })
      .populate('ownerRef', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: clinics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // If lat/lng provided, update GeoJSON
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      updates.location = {
        type: 'Point',
        coordinates: [parseFloat(updates.longitude), parseFloat(updates.latitude)],
      };
      delete updates.latitude;
      delete updates.longitude;
    }

    const clinic = await Clinic.findByIdAndUpdate(id, updates, { new: true });
    if (!clinic) return res.status(404).json({ success: false, message: 'Clinic not found' });
    res.json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PRODUCTS ───────────────────────────────────────────────────────────────

exports.getAllProducts = async (req, res) => {
  try {
    const filter = { isDeleted: { $ne: true } };
    if (req.query.filter === 'low_stock') {
      filter.stock = { $lt: 5 };
    }
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, category, price, description, imageUrl, stock, brand, isFeatured } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
    }
    const product = await Product.create({
      name, category, price, description, imageUrl, stock: stock || 0, brand, isFeatured: isFeatured || false,
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product soft-deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── USERS ──────────────────────────────────────────────────────────────────

exports.getAllUsers = async (req, res) => {
  try {
    const filter = { isDeleted: { $ne: true } };
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();

    // Attach stats for each user
    const enriched = await Promise.all(users.map(async (u) => {
      const [appointmentsCount, ordersCount, consultsCount] = await Promise.all([
        Appointment.countDocuments({ petOwnerRef: u._id }),
        Order.countDocuments({ userRef: u._id }),
        ConsultSession.countDocuments({ petOwnerRef: u._id }),
      ]);
      return { ...u, appointmentsCount, ordersCount, consultsCount };
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ORDERS ─────────────────────────────────────────────────────────────────

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userRef', 'name email phone')
      .populate('items.productRef', 'name imageUrl price')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['placed', 'processing', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('userRef', 'name email')
      .populate('assignedAgent');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status === 'processing' && order.assignedAgent) {
      emailService.sendOrderProcessing(order.userRef.email, order.userRef.name, order, order.assignedAgent);
    } else if (status === 'delivered') {
      emailService.sendOrderDelivered(order.userRef.email, order.userRef.name, order);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminCancelOrder = async (req, res) => {
  try {
    const { reason, refundAmount } = req.body;
    const order = await Order.findById(req.params.id).populate('userRef', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    }

    order.status = 'cancelled';
    order.isCancelled = true;
    order.cancelledBy = 'admin';
    order.cancellationReason = reason || 'Cancelled by admin';
    order.cancelledAt = new Date();

    if (order.paymentMethod === 'prepaid' && refundAmount > 0) {
      order.refundStatus = 'pending';
      order.refundAmount = refundAmount;
      console.log('REFUND PENDING: Order', order._id, '₹', refundAmount, 'to user', order.userRef._id);
    }

    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productRef, { $inc: { stock: item.qty } });
    }

    if (order.userRef && order.userRef.email) {
      emailService.sendOrderCancelled(order.userRef.email, order.userRef.name, order, 'admin');
    }

    res.json({ success: true, message: 'Order cancelled by admin', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignAgent = async (req, res) => {
  try {
    const { agentId, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id).populate('userRef', 'name email');
    const agent = await DeliveryAgent.findById(agentId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    order.assignedAgent = agentId;
    order.assignedAt = new Date();
    order.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : new Date(Date.now() + 2 * 60 * 60 * 1000); // default 2 hours

    if (order.status === 'placed') {
      order.status = 'processing';
    }
    
    await order.save();
    
    agent.totalDeliveries += 1;
    await agent.save();

    await order.populate('assignedAgent');

    if (order.userRef && order.userRef.email) {
      emailService.sendOrderProcessing(order.userRef.email, order.userRef.name, order, agent);
    }

    res.json({ success: true, message: 'Agent assigned', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELIVERY AGENTS ───────────────────────────────────────────────────────

exports.getDeliveryAgents = async (req, res) => {
  try {
    const filter = { isActive: { $ne: false } };
    if (req.query.isActive === 'true') filter.isActive = true;
    const agents = await DeliveryAgent.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDeliveryAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgent.create(req.body);
    res.status(201).json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDeliveryAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    res.json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleAgentStatus = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    agent.isActive = !agent.isActive;
    await agent.save();
    res.json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDeliveryAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    res.json({ success: true, message: 'Agent deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrdersByAgent = async (req, res) => {
  try {
    const orders = await Order.find({ assignedAgent: req.params.agentId })
      .populate('userRef', 'name email phone')
      .populate('items.productRef', 'name imageUrl price')
      .sort({ assignedAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── APPOINTMENTS ───────────────────────────────────────────────────────────

exports.getAllAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }

    const appointments = await Appointment.find(filter)
      .populate('petOwnerRef', 'name email phone')
      .populate('clinicRef', 'name address')
      .sort({ date: -1 })
      .lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONSULT SESSIONS ───────────────────────────────────────────────────────

exports.getAllConsults = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const sessions = await ConsultSession.find(filter)
      .populate('petOwnerRef', 'name email')
      .populate('vetRef', 'name email specializations')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.refundConsult = async (req, res) => {
  try {
    const session = await ConsultSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'Only paid sessions can be refunded' });
    }

    // Attempt Razorpay refund if payment ID exists
    if (session.razorpayPaymentId) {
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
        });
        await razorpay.payments.refund(session.razorpayPaymentId, {
          amount: session.fee * 100,
        });
      } catch (rpErr) {
        console.error('Razorpay refund error:', rpErr.message);
        // Continue with local status update even if Razorpay call fails in dev
      }
    }

    session.paymentStatus = 'refunded';
    session.status = 'cancelled';
    await session.save();

    res.json({ success: true, data: session, message: 'Refund processed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SITE SETTINGS ──────────────────────────────────────────────────────────

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await SiteSetting.find().sort({ key: 1 }).lean();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await SiteSetting.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { new: true }
    );
    if (!setting) return res.status(404).json({ success: false, message: `Setting '${key}' not found` });

    // Update global cache
    if (global.siteSettings) {
      global.siteSettings[key] = value;
    }

    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLIC SETTINGS ────────────────────────────────────────────────────────

exports.getPublicSettings = async (req, res) => {
  try {
    const publicKeys = [
      'homepage_banner_text',
      'homepage_banner_subtext',
      'consult_enabled',
      'marketplace_enabled',
    ];
    const settings = await SiteSetting.find({ key: { $in: publicKeys } }).lean();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
