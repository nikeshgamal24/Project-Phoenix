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
  .get(
    verifyRoles(roleList.Supervisor),
    supervisorController.getAllActiveProjects
  );

router
  .route("/projects/archive")
  .get(
    verifyRoles(roleList.Supervisor),
    supervisorController.getAllArchiveProjects
  );

router
  .route("/project/:id")
  .get(verifyRoles(roleList.Supervisor), supervisorController.getProjectBydId);

router
  .route("/events/active")
  .get(
    verifyRoles(roleList.Supervisor),
    supervisorController.getAllActiveEvents
  );

router
  .route("/supervisor/availability")
  .post(
    verifyRoles(roleList.Supervisor),
    supervisorController.toogleAvailabilityOfSupervisor
  );

router
  .route("/supervisor/progress-log/verify/:id")
  .post(
    verifyRoles(roleList.Supervisor),
    supervisorController.progressLogVerify
  );

router
  .route("/supervisor/progress-log/grant-approval/:id")
  .post(
    verifyRoles(roleList.Supervisor),
    supervisorController.progressLogApprovalGrant
  );

module.exports = router;
