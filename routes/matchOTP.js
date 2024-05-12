const express = require('express');
const router = express.Router();
const otpMatchController = require('../controllers/otpMatchController');

router.post('/',otpMatchController.matchOTP);

module.exports = router;