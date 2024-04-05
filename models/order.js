const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');
const Cart = require('./cart');
const Product = require('./product');

const ordersFilePath = path.join(rootDir, 'data', 'orders.json');

module.exports = class Order {
  static createOrder(user, callback) {
    Order.getCartInfo(user, (productsInfo) => {
      const order = {
        id: Math.random().toString(),
        user,
        products: productsInfo,
      };

      Order.getOrdersFromFile((orders) => {
        fs.writeFile(
          ordersFilePath,
          JSON.stringify([...orders, order]),
          (err) => {
            if (err) {
              console.log({ err });
              throw new Error(err);
            }
            Cart.clearCart(user.id, () => {
              callback(order);
            });
          }
        );
      });
    });
  }

  static getCartInfo({ id }, callback) {
    Cart.getCart((cart) => {
      const userCart = cart.products.filter((item) => item.userId === id);
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

  static getOrdersFromFile(callback) {
    fs.readFile(ordersFilePath, (err, data) => {
      if (err) {
        throw new Error(err);
      }
      callback(JSON.parse(data));
    });
  }

  static getUserOrdersFromFile(userId, callback) {
    Order.getOrdersFromFile((orders) => {
      callback(orders.filter((order) => order.user.id === userId));
    });
  }

  static findById(id, callback) {
    Order.getOrdersFromFile((orders) => {
      const order = orders.find((item) => item.id === id);
      callback(order);
    });
  }
};
