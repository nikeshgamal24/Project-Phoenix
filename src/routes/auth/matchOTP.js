const express = require('express');
const router = express.Router();
const otpMatchController = require('../../controllers/auth/otpMatchController');
const { validate, authSchemas } = require('../../middleware/validation/validation');

router.post('/', validate(authSchemas.otp), otpMatchController.matchOTP);

module.exports = router;