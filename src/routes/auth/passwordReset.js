const express = require('express');
const router = express.Router();
const passwordResetController = require('../../controllers/auth/passwordResetController');
const { validate, authSchemas } = require('../../middleware/validation/validation');

router.post('/', validate(authSchemas.newPassword), passwordResetController.passwordReset);

module.exports = router;