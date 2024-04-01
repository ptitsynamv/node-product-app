const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  const [errorMessage] = req.flash('error');

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findByEmail(email, (user) => {
    if (!user) {
      req.flash('error', 'Invalid email or password.');
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
      req.flash('error', 'Invalid email or password.');
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
  const [errorMessage] = req.flash('error');

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  User.findByEmail(email, (user) => {
    if (user) {
      req.flash('error', 'Email exists');
      return res.redirect('/signup');
    }
    bcryptjs.hash(password, 12).then((hashedPassword) => {
      new User({ email, password: hashedPassword }).save(() => {
        res.redirect('/login');
      });
    });
  });
};

exports.getReset = (req, res, next) => {
  const [errorMessage] = req.flash('error');

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset password',
    isAuthenticated: false,
    errorMessage,
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      req.flash('error', 'Crypto error');
      return res.redirect('/reset');
    }

    const resetToken = buffer.toString('hex');
    User.findByEmail(email, (user) => {
      if (!user) {
        req.flash('error', 'There is no user');
        return res.redirect('/reset');
      }
      new User({
        ...user,
        resetToken,
        resetTokenExpiration: new Date() + 3600000,
      }).save(() => {
        // TODO: send email to user with resetToken
        res.render('auth/fake-email', {
          path: '/fake-email',
          pageTitle: 'Fake Email',
          isAuthenticated: false,
          resetToken,
        });
      });
    });
  });
};
