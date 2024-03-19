const express = require('express');
const path = require('path');
const rootDir = require('../utils/path');

const router = express.Router();

const products = [];

router.get('/add-product', (req, res, next) => {
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('add-product', {
    path: '/admin/add-product',
    pageTitle: 'Add product',
  });
});

router.post('/add-product', (req, res, next) => {
  const { title } = req.body;
  products.push({ title });
  res.redirect('/');
});

exports.router = router;
exports.products = products;
