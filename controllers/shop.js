const Product = require('../models/product');
const Cart = require('../models/cart');

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
    Cart.addProduct(productId, product.price);
  });
  res.redirect('/cart');
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
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Orders',
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};
