exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isAuthenticated,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  req.session.isAuthenticated = true;
  res.redirect('/');
};
