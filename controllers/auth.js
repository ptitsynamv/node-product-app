const bcryptjs = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isAuthenticated,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findByEmail(email, (user) => {
    if (!user) {
      return res.redirect('/login');
    }

    bcryptjs.compare(password, user.password).then((doMatch) => {
      if (doMatch) {
        req.session.isAuthenticated = true;
        req.session.user = user;
        return req.session.save(() => {
          return res.redirect('/');
        });
      }
      res.redirect('/login');
    });
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  User.findByEmail(email, (user) => {
    if (user) {
      return res.redirect('/signup');
    }
    bcryptjs.hash(password, 12).then((hashedPassword) => {
      new User({ email, password: hashedPassword }).save(() => {
        res.redirect('/login');
      });
    });
  });
};
