const express = require('express');
const { register, login, verifyEmail,verifyPhone } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.get('/verify-phone',verifyPhone)

module.exports = router;
