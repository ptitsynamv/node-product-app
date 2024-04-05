const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      products,
      path: '/products',
      pageTitle: 'All products',
    });
  });
};

exports.getProduct = (req, res, next) => {
  const { id } = req.params;

  Product.findById(id, (product) => {
    res.render('shop/product-detail', {
      product,
      path: '/product',
      pageTitle: `Product ${product.title}`,
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/index', {
      products,
      path: '/',
      pageTitle: 'Shop',
    });
  });
};

exports.getCart = (req, res, next) => {
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = products.reduce((prev, item) => {
        const cartProduct = cart.products.find((prod) => prod.id === item.id);
        if (cartProduct) {
          prev.push({
            productData: item,
            quantity: cartProduct.quantity,
          });
        }
        return prev;
      }, []);

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Cart',
        products: cartProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  Product.findById(productId, (product) => {
    Cart.addProduct(productId, product.price, req.user.id, () => {
      res.redirect('/cart');
    });
  });
};

exports.postCartDeleteItem = (req, res, next) => {
  const { productId } = req.body;

  Product.findById(productId, (product) => {
    Cart.deleteProduct(productId, product.price, () => {
      res.redirect('/cart');
    });
  });
};

exports.getOrders = (req, res, next) => {
  const { id } = req.user;

  Order.getUserOrdersFromFile(id, (orders) => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders,
    });
  });
};

exports.postOrder = (req, res, next) => {
  const { id, email } = req.user;

  Order.createOrder({ id, email }, (order) => {
    res.redirect('/orders');
  });
};

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;

  const invoiceName = `invoice-${orderId}.pdf`;

  const invoicePath = path.join('data', 'invoices', invoiceName);
  fs.readFile(invoicePath, (err, data) => {
    if (err) {
      return next(err);
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoiceName}.pdf"`
    );
    res.send(data);
  });
};
