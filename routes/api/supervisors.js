const express = require("express");
const router = express.Router();
const supervisorController = require("../../controllers/supervisorController");
const roleList = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/supervisors/:id")
  .put(verifyRoles(roleList.Supervisor), supervisorController.updateSupervisor);


module.exports = router;
