const express = require("express");
const router = express.Router();
const getUserInformationController = require("../../controllers/shared/getUserInformationController");

router.get("/account", getUserInformationController.getUserInformation);

module.exports = router;
