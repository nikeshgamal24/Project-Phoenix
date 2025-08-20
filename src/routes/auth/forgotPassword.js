const express = require("express");
const router = express.Router();
const forgotPasswordController = require("../../controllers/auth/forgotPasswordController");
const { validate, authSchemas } = require("../../middleware/validation/validation");

router.post("/", validate(authSchemas.passwordReset), forgotPasswordController.forgotPassword);

module.exports = router;
