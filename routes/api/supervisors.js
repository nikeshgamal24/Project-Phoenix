const express = require("express");
const router = express.Router();
const supervisorController = require("../../controllers/supervisorController");
const roleList = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/supervisors/:id")
  .put(verifyRoles(roleList.Supervisor), supervisorController.updateSupervisor);

router
  .route("/projects/active")
  .get(verifyRoles(roleList.Supervisor), supervisorController.getAllActiveProjects);

router
  .route("/projects/archive")
  .get(verifyRoles(roleList.Supervisor), supervisorController.getAllArchiveProjects);

router
  .route("/project/:id")
  .get(verifyRoles(roleList.Supervisor), supervisorController.getProjectBydId);

module.exports = router;
