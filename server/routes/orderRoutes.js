const express = require('express');
const { getMyOrders, createOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/me', protect, getMyOrders);
router.post('/', protect, createOrder);
router.post('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;
