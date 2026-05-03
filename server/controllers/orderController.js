const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// GET /api/orders/me
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userRef: req.user.id })
      .populate('items.productRef', 'name imageUrl price category')
      .populate('assignedAgent')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let total = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productRef);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productRef} not found` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      enrichedItems.push({ productRef: product._id, qty: item.qty, price: product.price });
      total += product.price * item.qty;
    }

    // Deduct stock
    for (const item of enrichedItems) {
      await Product.findByIdAndUpdate(item.productRef, { $inc: { stock: -item.qty } });
    }

    const order = await Order.create({
      userRef: req.user.id,
      items: enrichedItems,
      total,
      address,
      status: 'placed'
    });

    // Fire & Forget email confirmation
    User.findById(req.user.id).select('name email').then(user => {
      if (user && user.email) {
        emailService.sendOrderConfirmation(user.email, user.name, order);
      }
    }).catch(console.error);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, userRef: req.user.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order already cancelled' });
    }
    if (order.status === 'processing') {
      return res.status(400).json({ success: false, message: 'Order is already being processed. Contact support to cancel.' });
    }
    if (order.status !== 'placed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage' });
    }

    order.status = 'cancelled';
    order.isCancelled = true;
    order.cancelledBy = 'customer';
    order.cancellationReason = reason || 'No reason given';
    order.cancelledAt = new Date();

    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productRef, { $inc: { stock: item.qty } });
    }

    // Fire & Forget email cancellation
    User.findById(req.user.id).select('name email').then(user => {
      if (user && user.email) {
        emailService.sendOrderCancelled(user.email, user.name, order, 'customer');
      }
    }).catch(console.error);

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can update order status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
