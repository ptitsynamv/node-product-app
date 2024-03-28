const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');
const Cart = require('./cart');
const Product = require('./product');

const filePath = path.join(rootDir, 'data', 'users.json');
const ordersFilePath = path.join(rootDir, 'data', 'orders.json');

module.exports = class User {
  constructor({ id, email, password }) {
    this.id = id;
    this.email = email;
    this.password = password;
  }

  static findById(id, callback) {
    getUsersFromFile((users) => {
      const user = users.find((item) => item.id === id);
      callback(user);
    });
  }

  createOrder(callback) {
    this.getCartInfo((productsInfo) => {
      const order = { id: Math.random().toString(), products: productsInfo };

      this.getOrdersFromFile((orders) => {
        fs.writeFile(
          ordersFilePath,
          JSON.stringify([...orders, order]),
          (err) => {
            if (!err) {
              Cart.clearCart(this.id, () => {
                callback(order);
              });
            }
          }
        );
      });
    });
  }

  getCartInfo(callback) {
    Cart.getCart((cart) => {
      const userCart = cart.products.filter((item) => item.userId === this.id);
      Product.fetchAll((products) => {
        const productsInfo = userCart.reduce((prev, curr) => {
          const productInfo = products.find((i) => i.id === curr.id);
          prev.push({ ...productInfo, quantity: curr.quantity });
          return prev;
        }, []);
        callback(productsInfo);
      });
    });
  }

  getOrdersFromFile(callback) {
    fs.readFile(ordersFilePath, (err, data) => {
      if (err) {
        return callback([]);
      }
      callback(JSON.parse(data));
    });
  }
};

const getUsersFromFile = (callback) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      return callback([]);
    }
    callback(JSON.parse(data));
  });
};
