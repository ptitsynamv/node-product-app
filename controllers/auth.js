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

  User.findById('id-1', (user) => {
    req.session.isAuthenticated = true;
    req.session.user = user;
    req.session.save(() => {
      res.redirect('/');
    });
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
