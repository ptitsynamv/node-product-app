const express = require('express');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password', 'Invalid password').isLength({ min: 1, max: 10 }).trim(),
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  [
    check('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password', 'Invalid password')
      .isLength({ min: 1, max: 10 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match');
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);

router.get('/reset/:token', authController.getNewPassword);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
