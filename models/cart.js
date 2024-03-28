const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const filePath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice, userId, callback) {
    Cart.getCart((cart) => {
      const existingProductIndex = cart.products.findIndex(
        (item) => item.id === id
      );
      const existingProduct = cart.products[existingProductIndex];

      let updatedProduct;
      if (existingProduct) {
        updatedProduct = {
          ...existingProduct,
          quantity: existingProduct.quantity + 1,
        };
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, quantity: 1, userId };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice += +productPrice;

      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        callback();
      });
    });
  }

  static deleteProduct(id, productPrice, callback) {
    Cart.getCart((cart) => {
      const product = cart.products.find((item) => item.id === id);
      if (!product) {
        return callback();
      }

      cart.totalPrice = cart.totalPrice - productPrice * product.quantity;

      cart.products = cart.products.filter((item) => item.id !== id);

      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        console.log({ err });
        callback();
      });
    });
  }

  static getCart(callback) {
    fs.readFile(filePath, (err, data) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(data);
      }
      callback(cart);
    });
  }

  static clearCart(userId, callback) {
    Cart.getCart((cart) => {
      const updated = cart.products.filter((item) => item.userId !== userId);
      fs.writeFile(
        filePath,
        JSON.stringify({ products: updated, totalPrice: 0 }),
        (err) => {
          callback();
        }
      );
    });
  }
};
