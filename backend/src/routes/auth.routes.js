const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  authController.login
);

router.post(
  '/register',
  authMiddleware,
  [body('nombre').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  authController.register
);

module.exports = router;
