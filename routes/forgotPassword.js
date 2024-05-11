const express = require("express");
const router = express.Router();
const forgotPasswordController = require("../controllers/forgotPasswordController");

router.get("/", forgotPasswordController.forgotPassword);

module.exports = router;
