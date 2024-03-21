const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const filePath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(filePath, (err, data) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(data);
      }
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
        updatedProduct = { id, quantity: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice += +productPrice;

      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        console.log({ err });
      });
    });
  }

  static deleteProduct(id, productPrice, callback) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return;
      }

      const updatedCart = JSON.parse(data);

      const product = updatedCart.products.find((item) => item.id === id);
      if (!product) {
        return callback();
      }

      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * product.quantity;
      updatedCart.products = updatedCart.products.filter(
        (item) => item.id !== id
      );

      fs.writeFile(filePath, JSON.stringify(updatedCart), (err) => {
        console.log({ err });
        callback();
      });
    });
  }

  static getCart(callback) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return callback(null);
      }

      const cart = JSON.parse(data);
      callback(cart);
    });
  }
};
