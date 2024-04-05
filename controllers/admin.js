const { validationResult } = require('express-validator');

const Product = require('../models/product');
const { deleteFile } = require('../utils/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    path: '/admin/add-product',
    pageTitle: 'Add product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, description, price } = req.body;
  const { file } = req;
  if (!file) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add product',
      editing: false,
      product: { title, description, price },
      hasError: true,
      errorMessage: ['File is not an image'],
      validationErrors: [],
    });
  }
  console.log({ file });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add product',
      editing: false,
      product: { title, description, price },
      hasError: true,
      errorMessage: errors
        .array()
        .map((item) => item.msg)
        .join(','),
      validationErrors: errors.array(),
    });
  }

  const imageUrl = file.path;

  try {
    const product = new Product(
      null,
      title,
      imageUrl,
      description,
      price,
      req.user.id
    );
    product.save();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
  res.redirect('/admin/products');
};

exports.getEditProduct = (req, res, next) => {
  const { id } = req.params;
  const { edit: editMode } = req.query;

  if (!editMode) {
    return res.redirect('/');
  }

  Product.findById(id, (product) => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      path: '/admin/edit-product',
      pageTitle: 'Edit product',
      editing: editMode,
      product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, description, price } = req.body;
  const { file } = req;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/edit-product',
      pageTitle: 'Edit product',
      editing: true,
      product: { id, title, description, price },
      hasError: true,
      errorMessage: errors
        .array()
        .map((item) => item.msg)
        .join(','),
      validationErrors: errors.array(),
    });
  }

  Product.findById(id, (product) => {
    if (product.userId !== req.user.id) {
      return res.redirect('/');
    }

    let imageUrl = product.imageUrl;
    if (file) {
      deleteFile(product.imageUrl);
      imageUrl = file.path;
    }

    const updatedProduct = new Product(
      id,
      title,
      imageUrl,
      description,
      price,
      req.user.id
    );
    updatedProduct.save();
    res.redirect('/admin/products');
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body;

  Product.findById(id, (product) => {
    if (product.userId !== req.user.id) {
      return res.redirect('/');
    }
    Product.deleteById(id, () => {
      deleteFile(product.imageUrl);
      res.redirect('/admin/products');
    });
  });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAllByUserId(req.user.id, (products) => {
    res.render('admin/products', {
      products,
      path: '/admin/products',
      pageTitle: 'Admin Products',
    });
  });
};
