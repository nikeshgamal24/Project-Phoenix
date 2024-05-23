const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");



router
  .route("/create")
  .post(verifyRoles(ROLES_LIST.Admin), eventController.createNewEvent);
router
  .route("/events")
  .get(verifyRoles(ROLES_LIST.Admin), eventController.getAllEvents);

router
  .route("/events/:id")
  .get(verifyRoles(ROLES_LIST.Admin), eventController.getEvent)
  .put(verifyRoles(ROLES_LIST.Admin), eventController.updateEvent);

module.exports = router;
