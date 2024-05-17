const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/studentController");
const roleList = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/events")
  .get(verifyRoles(roleList.Student), studentController.getAllEvents);

router
  .route("/students/:id")
  .put(verifyRoles(roleList.Student), studentController.updateStudent);

router
  .route("/event")
  .get(verifyRoles(roleList.Student), studentController.getMyEvent);

module.exports = router;
