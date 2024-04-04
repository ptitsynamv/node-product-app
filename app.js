const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const fileStore = require('session-file-store')(session);
const csurf = require('csurf');
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { get404, get500 } = require('./controllers/error');
const User = require('./models/user');

const app = express();

const csurfProtection = csurf();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
    store: new fileStore(), // doesnt work with connect-flash
  })
);
app.use(csurfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user.id, (user) => {
      if (!user) {
        return next();
      }
      req.user = new User({ ...user });
      return next();
    });
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', get500);
app.use(get404);

app.use((error, req, res, next) => {
  res.redirect('/500');
});

app.listen(3000);
