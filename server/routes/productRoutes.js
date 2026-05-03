const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, updateProduct);

module.exports = router;
