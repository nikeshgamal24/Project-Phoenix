const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

router.post('/',passwordResetController.passwordReset);

module.exports = router;