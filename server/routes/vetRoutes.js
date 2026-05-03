const express = require('express');
const router = express.Router();
const { getNearbyVets, getVetById, getMyClinic, createClinic } = require('../controllers/vet.controller');
const { protect } = require('../middleware/auth');

router.get('/', getNearbyVets);
router.get('/mine', protect, getMyClinic);
router.get('/:id', getVetById);
router.post('/', protect, createClinic);

module.exports = router;
