const express = require('express');
const router = express.Router();
const adminOnly = require('../middleware/adminOnly.middleware');
const ctrl = require('../controllers/admin.controller');

// All routes require admin authentication
router.use(adminOnly);

// Dashboard
router.get('/stats', ctrl.getStats);

// Vets
router.get('/vets', ctrl.getAllVets);
router.post('/vets/add', ctrl.addVet);
router.patch('/vets/:id/approve', ctrl.approveVet);
router.patch('/vets/:id/suspend', ctrl.suspendVet);
router.patch('/vets/:id/restore', ctrl.restoreVet);
router.delete('/vets/:id', ctrl.deleteVet);

// Clinics
router.get('/clinics', ctrl.getAllClinics);
router.patch('/clinics/:id', ctrl.updateClinic);

// Products
router.get('/products', ctrl.getAllProducts);
router.post('/products/add', ctrl.addProduct);
router.patch('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// Users
router.get('/users', ctrl.getAllUsers);
router.patch('/users/:id/ban', ctrl.banUser);
router.patch('/users/:id/unban', ctrl.unbanUser);

// Orders
router.get('/orders', ctrl.getAllOrders);
router.patch('/orders/:id/status', ctrl.updateOrderStatus);
router.post('/orders/:id/cancel', ctrl.adminCancelOrder);
router.patch('/orders/:id/assign-agent', ctrl.assignAgent);
router.get('/orders/by-agent/:agentId', ctrl.getOrdersByAgent);

// Delivery Agents
router.get('/delivery-agents', ctrl.getDeliveryAgents);
router.post('/delivery-agents', ctrl.createDeliveryAgent);
router.patch('/delivery-agents/:id', ctrl.updateDeliveryAgent);
router.patch('/delivery-agents/:id/toggle', ctrl.toggleAgentStatus);
router.delete('/delivery-agents/:id', ctrl.deleteDeliveryAgent);

// Appointments
router.get('/appointments', ctrl.getAllAppointments);
router.patch('/appointments/:id/cancel', ctrl.cancelAppointment);

// Consult Sessions
router.get('/consults', ctrl.getAllConsults);
router.post('/consults/:id/refund', ctrl.refundConsult);

// Site Settings
router.get('/settings', ctrl.getAllSettings);
router.patch('/settings/:key', ctrl.updateSetting);

module.exports = router;
