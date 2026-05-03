const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const ConsultSession = require('../models/ConsultSession');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// ─── GET /api/consult/available-vets ────────────────────────────────────────
exports.getAvailableVets = async (req, res) => {
  try {
    const vets = await User.find({ role: 'vet', isOnline: true })
      .select('name email phone specializations consultFee rating totalRatings profilePic isOnline')
      .lean();
    res.json({ success: true, data: vets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/consult/create-order ─────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { vetId, petName, petType, issue } = req.body;
    if (!vetId || !petName || !petType) {
      return res.status(400).json({ success: false, message: 'vetId, petName, petType are required' });
    }

    const vet = await User.findById(vetId).lean();
    if (!vet || vet.role !== 'vet') {
      return res.status(404).json({ success: false, message: 'Vet not found' });
    }
    if (!vet.isOnline) {
      return res.status(400).json({ success: false, message: 'Vet is currently offline' });
    }

    const fee = vet.consultFee || 500;
    
    const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY_ID') || process.env.RAZORPAY_KEY_ID.includes('placeholder');
    let rpOrderId = 'mock_order_' + Date.now();
    let amount = fee * 100;

    if (!isMock) {
      // Create Razorpay order
      const rpOrder = await razorpay.orders.create({
        amount: amount, // paise
        currency: 'INR',
        receipt: 'consult_' + Date.now(),
      });
      rpOrderId = rpOrder.id;
    }

    // Create ConsultSession record
    const session = await ConsultSession.create({
      petOwnerRef: req.user.id,
      vetRef: vetId,
      petName,
      petType,
      issue: issue || '',
      fee,
      razorpayOrderId: rpOrderId,
      status: 'payment_pending',
      paymentStatus: 'pending',
    });

    res.json({
      success: true,
      data: {
        orderId: rpOrderId,
        amount: amount,
        currency: 'INR',
        sessionId: session._id,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        vetName: vet.name,
        vetFee: fee,
        isMock
      },
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/consult/verify-payment ───────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

    if (!isMock) {
      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
        .update(body)
        .digest('hex');

      if (expectedSig !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    }

    const session = await ConsultSession.findByIdAndUpdate(
      sessionId,
      {
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id || 'mock_payment_' + Date.now(),
        status: 'waiting',
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/consult/session/:id ───────────────────────────────────────────
exports.getSession = async (req, res) => {
  try {
    const session = await ConsultSession.findById(req.params.id)
      .populate('vetRef', 'name email specializations consultFee rating profilePic')
      .populate('petOwnerRef', 'name email phone')
      .lean();

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Ensure requester is part of the session
    const userId = req.user.id;
    if (
      session.petOwnerRef._id.toString() !== userId &&
      session.vetRef._id.toString() !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/consult/complete ──────────────────────────────────────────────
exports.completeSession = async (req, res) => {
  try {
    const { sessionId, duration } = req.body;
    const session = await ConsultSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.vetRef.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the vet can complete a session' });
    }

    session.status = 'completed';
    session.duration = duration || 15;
    await session.save();

    // Update vet earnings
    await User.findByIdAndUpdate(session.vetRef, {
      $inc: { totalEarnings: session.fee },
    });

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/consult/rate ──────────────────────────────────────────────────
exports.rateSession = async (req, res) => {
  try {
    const { sessionId, rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }

    const session = await ConsultSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.petOwnerRef.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the pet owner can rate' });
    }

    session.ownerRating = rating;
    session.ownerReview = review || '';
    await session.save();

    // Update vet's average rating
    const vet = await User.findById(session.vetRef);
    if (vet) {
      const newTotal = vet.totalRatings + 1;
      const newRating = ((vet.rating * vet.totalRatings) + rating) / newTotal;
      await User.findByIdAndUpdate(session.vetRef, {
        rating: Math.round(newRating * 10) / 10,
        totalRatings: newTotal,
      });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/consult/zego-token ─────────────────────────────────────────────
exports.getZegoToken = async (req, res) => {
  try {
    const { roomId } = req.query;
    const userId = req.user.id;
    const appId = parseInt(process.env.ZEGO_APP_ID || '0');
    const serverSecret = process.env.ZEGO_SERVER_SECRET || 'placeholder_secret_32chars_here!!';

    // Zegocloud token generation algorithm
    const effectiveTs = Math.floor(Date.now() / 1000);
    const expireTs = effectiveTs + 3600; // 1 hour

    const tokenInfo = {
      app_id: appId,
      user_id: userId,
      nonce: Math.floor(Math.random() * 2147483647),
      ctime: effectiveTs,
      expire: expireTs,
      payload: JSON.stringify({ room_id: roomId }),
    };

    const tokenInfoStr = JSON.stringify(tokenInfo);
    const hmac = crypto
      .createHmac('sha256', serverSecret)
      .update(tokenInfoStr)
      .digest();

    const token04 = Buffer.concat([
      Buffer.alloc(4), // version placeholder
      hmac,
      Buffer.from(tokenInfoStr),
    ]).toString('base64');

    res.json({ success: true, data: { token: token04, appId, userId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/consult/my-sessions ───────────────────────────────────────────
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await ConsultSession.find({ petOwnerRef: req.user.id })
      .populate('vetRef', 'name specializations rating profilePic')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/consult/vet-sessions ──────────────────────────────────────────
exports.getVetSessions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allSessions = await ConsultSession.find({ vetRef: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const todaySessions = allSessions.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= today && d < tomorrow;
    });

    const todayEarnings = todaySessions
      .filter((s) => s.paymentStatus === 'paid')
      .reduce((sum, s) => sum + (s.fee || 0), 0);

    const completedToday = todaySessions.filter((s) => s.status === 'completed').length;

    res.json({
      success: true,
      data: {
        allSessions,
        todaySessions,
        todayEarnings,
        completedToday,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
