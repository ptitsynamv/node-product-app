const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    path: '/admin/add-product',
    pageTitle: 'Add product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;
  const product = new Product(
    null,
    title,
    imageUrl,
    description,
    price,
    req.user.id
  );
  product.save();
  res.redirect('/');
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
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, imageUrl, description, price } = req.body;

  Product.findById(id, (product) => {
    if (product.userId !== req.user.id) {
      return res.redirect('/');
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
    res.redirect('/');
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body;

  Product.findById(id, (product) => {
    if (product.userId !== req.user.id) {
      return res.redirect('/');
    }
    Product.deleteById(id, () => {
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
