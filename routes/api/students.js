const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/studentController");
const roleList = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");
const {
  uploader,
} = require("../../controllers/utility functions/multerUploader");

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

//here id of the project
router
  .route("/team/report/:id")
  .post(
    verifyRoles(roleList.Student),
    uploader.single("file"),
    studentController.submitReport
  );

router
  .route("/team/students")
  .get(verifyRoles(roleList.Student), studentController.getAllStudentsList);

router
  .route("/project/:id")
  .get(verifyRoles(roleList.Student), studentController.getProjectById);

router
  .route("/archive/")
  .get(verifyRoles(roleList.Student), studentController.getAllArchiveProjects);

router
  .route("/progress-log/create")
  .post(verifyRoles(roleList.Student), studentController.createProgressLog);

router
  .route("/progress-log/:id") //get projectId for the log of the project id
  .get(verifyRoles(roleList.Student), studentController.getAllProjectLogsOfProject);
module.exports = router;
