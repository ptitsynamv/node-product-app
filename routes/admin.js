const express = require('express');
const { check, body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post(
  '/add-product',
  [
    body('title', 'Invalid title').isString().isLength({ min: 3 }).trim(),
    body('price', 'Invalid price').isFloat(),
    body('description', 'Invalid description')
      .isLength({ min: 3, max: 200 })
      .trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:id', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title', 'Invalid title').isString().isLength({ min: 3 }).trim(),
    body('price', 'Invalid price').isFloat(),
    body('description', 'Invalid description')
      .isLength({ min: 3, max: 200 })
      .trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
