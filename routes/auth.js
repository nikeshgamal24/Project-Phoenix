const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/", authController.handleLogin);
router.post("/evaluator", authController.handleEvaluatorLogin);

module.exports = router;
