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

router
  .route("/team/create")
  .post(verifyRoles(roleList.Student), studentController.createProjectTeam);

router
  .route("/team/students")
  .get(verifyRoles(roleList.Student), studentController.getAllStudentsList);

module.exports = router;
