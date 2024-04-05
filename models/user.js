const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const filePath = path.join(rootDir, 'data', 'users.json');

module.exports = class User {
  constructor({ id, email, password, resetToken, resetTokenExpiration }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.resetToken = resetToken;
    this.resetTokenExpiration = resetTokenExpiration;
  }

  save(callback) {
    getUsersFromFile((users) => {
      const updatedUsers = [...users];
      const existedIndex = users.findIndex((item) => item.id === this.id);

      if (existedIndex >= 0) {
        updatedUsers[existedIndex] = {
          id: this.id,
          email: this.email,
          password: this.password,
          resetToken: this.resetToken,
          resetTokenExpiration: this.resetTokenExpiration,
        };
      } else {
        updatedUsers.push({
          id: Math.random().toString(),
          email: this.email,
          password: this.password,
          resetToken: this.resetToken,
          resetTokenExpiration: this.resetTokenExpiration,
        });
      }

      fs.writeFile(filePath, JSON.stringify(updatedUsers), (err) => {
        if (err) {
          throw new Error(err);
        }
        callback();
      });
    });
  }

  static findById(id, callback) {
    getUsersFromFile((users) => {
      const user = users.find((item) => item.id === id);
      callback(user);
    });
  }

  static findByEmail(email, callback) {
    getUsersFromFile((users) => {
      const user = users.find((item) => item.email === email);
      callback(user);
    });
  }

  static findByResetToken(resetToken, callback) {
    getUsersFromFile((users) => {
      const user = users.find((item) => item.resetToken === resetToken);
      callback(user);
    });
  }
};

const getUsersFromFile = (callback) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw new Error(err);
    }
    callback(JSON.parse(data));
  });
};
