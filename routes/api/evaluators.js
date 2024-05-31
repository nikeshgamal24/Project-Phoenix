const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");
const evaluatorController = require("../../controllers/evaluatorController");

router
  .route("/defense/:id")
  .get(verifyRoles(ROLES_LIST.Evaluator), evaluatorController.getDefenseBydId);

router
  .route("/defense/project/:id")
  .get(verifyRoles(ROLES_LIST.Evaluator), evaluatorController.getProjectBydId);

module.exports = router;
