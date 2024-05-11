const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");
const eventController = require("../../controllers/eventController");

router
  .route("/create")
  .post(verifyRoles(ROLES_LIST.Admin), eventController.createNewEvent);
router
  .route("/events")
  .get(verifyRoles(ROLES_LIST.Admin), eventController.getAllEvents);

// .put(verifyRoles(ROLES_LIST.Admin), )
// .delete(verifyRoles(ROLES_LIST.Admin), employeesController.deleteEmployee);

router.route('/events/:id')
    .get(verifyRoles(ROLES_LIST.Admin),eventController.getEvent);

module.exports = router;
