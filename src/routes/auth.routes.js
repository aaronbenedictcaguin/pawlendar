const express = require('express');

const router = express.Router();

const authController =
  require('../controllers/auth.controller');

const authMiddleware =
  require('../middleware/auth.middleware');

const {
  validateRegister,
  validateLogin
} = require('../middleware/validation.middleware');

router.post(
  '/register',
  validateRegister,
  authController.register
);

router.post(
  '/login',
  validateLogin,
  authController.login
);

router.get(
  '/profile',
  authMiddleware,
  (req, res) => {
    res.json(req.user);
  }
);

module.exports = router;