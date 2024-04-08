const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
// const stripe = require('stripe')('stripeId');

const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;

  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      products: getItemsForPage(products, page),
      path: '/products',
      pageTitle: 'All products',
      ...getPaginationData(page, products.length),
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
  const page = +req.query.page || 1;

  Product.fetchAll((products) => {
    res.render('shop/index', {
      products: getItemsForPage(products, page),
      path: '/',
      pageTitle: 'Shop',
      ...getPaginationData(page, products.length),
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

exports.getCheckout = (req, res, next) => {
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

      // stripe.checkout.sessions.create({
      //   payment_method_types: ['card'],
      //   line_items: cartProducts.map((product) => {
      //     return {
      //       name: product.productData.title,
      //       description: product.productData.description,
      //       amount: product.productData.price * 100,
      //       currency: 'usd',
      //       quantity: product.quantity
      //     };
      //   }),
      //   success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
      //   cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      // });

      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: cartProducts,
        totalSum: cartProducts.reduce((sum, cartProduct) => {
          return sum + cartProduct.productData.price * cartProduct.quantity;
        }, 0),
        sessionId: 'session.id',
      });
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
  const { id } = req.user;

  Order.findById(orderId, (order) => {
    if (!order) {
      return next(new Error('No order found'));
    }
    if (order.user.id !== id) {
      return next(new Error('Unauthorized'));
    }

    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join('data', 'invoices', invoiceName);

    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader(
    //     'Content-Disposition',
    //     `attachment; filename="${invoiceName}.pdf"`
    //   );
    //   res.send(data);
    // });

    // Streaming file
    // const file = fs.createReadStream(invoicePath);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader(
    //   'Content-Disposition',
    //   `attachment; filename="${invoiceName}.pdf"`
    // );
    // file.pipe(res);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoiceName}.pdf"`
    );
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice');
    pdfDoc.fontSize(20).text('-----------------------------');
    let totalPrice = 0;
    order.products.forEach((product) => {
      pdfDoc
        .fontSize(14)
        .text(`${product.title} - ${product.quantity} x $${product.price}`);
      totalPrice += product.quantity * product.price;
    });
    pdfDoc.fontSize(20).text('-----------------------------');
    pdfDoc.fontSize(20).text(`Total price: ${totalPrice}`);

    pdfDoc.end();
  });
};

function getPaginationData(page, totalItems) {
  return {
    currentPage: page,
    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
    hasPrevPage: page > 1,
    nextPage: page + 1,
    prevPage: page - 1,
    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
  };
}

function getItemsForPage(items, page) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const limit = ITEMS_PER_PAGE;
  return items.slice(skip, skip + limit);
}
