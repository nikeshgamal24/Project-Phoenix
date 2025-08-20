const express = require('express');
const router = express.Router();
const oAuthController = require('../../controllers/auth/oAuthController');

router.get('/',oAuthController.googleOauthHandler);

module.exports = router;