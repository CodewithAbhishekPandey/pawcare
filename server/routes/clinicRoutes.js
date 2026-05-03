const express = require('express');
const { getClinics, createClinic } = require('../controllers/clinicController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .get(getClinics)
  .post(protect, createClinic);

module.exports = router;
