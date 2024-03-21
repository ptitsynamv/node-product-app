const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const filePath = path.join(rootDir, 'data', 'products.json');

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      const updatedProducts = [...products];

      if (this.id) {
        const existingProductIndex = products.findIndex(
          (item) => item.id === this.id
        );
        updatedProducts[existingProductIndex] = this;
      } else {
        this.id = Math.random().toString();
        updatedProducts.push(this);
      }

      fs.writeFile(filePath, JSON.stringify(updatedProducts), (err) => {
        console.log({ err });
      });
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static findById(id, callback) {
    getProductsFromFile((products) => {
      const product = products.find((item) => item.id === id);
      callback(product);
    });
  }
};

const getProductsFromFile = (callback) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      return callback([]);
    }
    callback(JSON.parse(data));
  });
};
