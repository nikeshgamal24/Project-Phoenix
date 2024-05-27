const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");
const eventController = require("../../controllers/eventController");

/******SECTION FOR EVENTS*********/
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

/******SECTION FOR EVALUATOR*********/
router
  .route("/evaluator/create")
  .post(verifyRoles(ROLES_LIST.Admin), eventController.createEvaluator);

router
  .route("/evaluators")
  .get(verifyRoles(ROLES_LIST.Admin), eventController.getAllEvaluators);

/******SECTION FOR DEFENSE*********/
router
  .route("/defense/create")
  .get(
    verifyRoles(ROLES_LIST.Admin),
    eventController.getAllEventsAndEvaluators
  );

router
  .route("/defense/create")
  .post(verifyRoles(ROLES_LIST.Admin), eventController.createNewDefense);

router
  .route("/defense/defenses")
  .get(verifyRoles(ROLES_LIST.Admin), eventController.getAllDefenses);

module.exports = router;
