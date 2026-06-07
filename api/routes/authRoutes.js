const express = require('express');

const {
  loginController,
  registerController,
  telegramMiniAppLoginController
} = require('../controllers/authController');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(loginController));
router.post('/register', asyncHandler(registerController));
router.post('/telegram-mini-app', asyncHandler(telegramMiniAppLoginController));

module.exports = {
  authRoutes: router
};
