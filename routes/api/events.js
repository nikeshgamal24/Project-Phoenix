const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");
const eventController = require("../../controllers/eventController");

/******SECTION FOR EVENTS*********/

/**
 * @openapi
 * '/api/event/create':
 *   post:
 *     tags:
 *       - Events API
 *     summary: Create Event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventName
 *               - description
 *               - eventTarget
 *               - eventType
 *               - year
 *             properties:
 *               eventName:
 *                 type: string
 *                 example: "DEMO Project 2024"
 *               description:
 *                 type: string
 *                 example: "This is a description of the example event."
 *               eventTarget:
 *                 type: string
 *                 example: "700"
 *               eventType:
 *                 type: string
 *                 example: "2"
 *               proposal:
 *                 type: object
 *                 properties:
 *                   defense:
 *                     type: boolean
 *                     example: true
 *                   defenseDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-20T12:00:00Z"
 *                   reportDeadline:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-15T12:00:00Z"
 *               mid:
 *                 type: object
 *                 properties:
 *                   defense:
 *                     type: boolean
 *                     example: true
 *                   defenseDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-08-10T12:00:00Z"
 *                   reportDeadline:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-08-05T12:00:00Z"
 *               final:
 *                 type: object
 *                 properties:
 *                   defense:
 *                     type: boolean
 *                     example: true
 *                   defenseDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-10T12:00:00Z"
 *                   reportDeadline:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-05T12:00:00Z"
 *               year:
 *                 type: integer
 *                 example: 2024
 *     responses:
 *       201:
 *         description: New Event Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   type: object
 *                   properties:
 *                     eventCode:
 *                       type: string
 *                     eventName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     eventTarget:
 *                       type: string
 *                     eventType:
 *                       type: string
 *                     eventStatus:
 *                       type: string
 *                     proposal:
 *                       type: object
 *                       properties:
 *                         defense:
 *                           type: boolean
 *                         defenseDate:
 *                           type: string
 *                           format: date-time
 *                         reportDeadline:
 *                           type: string
 *                           format: date-time
 *                         phase:
 *                           type: string
 *                     mid:
 *                       type: object
 *                       properties:
 *                         defense:
 *                           type: boolean
 *                         defenseDate:
 *                           type: string
 *                           format: date-time
 *                         reportDeadline:
 *                           type: string
 *                           format: date-time
 *                         phase:
 *                           type: string
 *                     final:
 *                       type: object
 *                       properties:
 *                         defense:
 *                           type: boolean
 *                         defenseDate:
 *                           type: string
 *                           format: date-time
 *                         reportDeadline:
 *                           type: string
 *                           format: date-time
 *                         phase:
 *                           type: string
 *                     year:
 *                       type: integer
 *                     author:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         fullname:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                         __v:
 *                           type: integer
 *                         photo:
 *                           type: string
 *                     projects:
 *                       type: array
 *                       items: {}
 *                     _id:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

router
  .route("/create")
  .post(verifyRoles(ROLES_LIST.Admin), eventController.createNewEvent);

/**
 * @openapi
 * '/api/event/events':
 *   post:
 *     tags:
 *       - Events API
 *     summary: Get All Events
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: integer
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "66582sdfg77b008b4a92e1d7716d"
 *                       eventCode:
 *                         type: string
 *                         example: "M-19-0202Y"
 *                       eventName:
 *                         type: string
 *                         example: "DEMO Project 2024"
 *                       description:
 *                         type: string
 *                         example: "This is a description of the example event."
 *                       eventTarget:
 *                         type: string
 *                         example: "700"
 *                       eventType:
 *                         type: string
 *                         example: "2"
 *                       eventStatus:
 *                         type: string
 *                         example: "101"
 *                       proposal:
 *                         type: object
 *                         properties:
 *                           defense:
 *                             type: boolean
 *                             example: true
 *                           defenseDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-20T12:00:00.000Z"
 *                           reportDeadline:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-15T12:00:00.000Z"
 *                           phase:
 *                             type: string
 *                             example: "1"
 *                       mid:
 *                         type: object
 *                         properties:
 *                           defense:
 *                             type: boolean
 *                             example: true
 *                           defenseDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-10T12:00:00.000Z"
 *                           reportDeadline:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-05T12:00:00.000Z"
 *                           phase:
 *                             type: string
 *                             example: "1"
 *                       final:
 *                         type: object
 *                         properties:
 *                           defense:
 *                             type: boolean
 *                             example: true
 *                           defenseDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-10-10T12:00:00.000Z"
 *                           reportDeadline:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-10-05T12:00:00.000Z"
 *                           phase:
 *                             type: string
 *                             example: "1"
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       author:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6645ebafa6sdfg58283c84c308a4"
 *                           email:
 *                             type: string
 *                             example: "goku.saiyan@gmail.com"
 *                           fullname:
 *                             type: string
 *                             example: "Goku Saiyan"
 *                           phoneNumber:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-16T11:19:11.688Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-30T07:14:53.817Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                           photo:
 *                             type: string"
 *                       projects:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "6658277b00ad8b4a92e1d7716d"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-05-30T07:15:07.821Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-05-30T07:15:07.821Z"
 *                       __v:
 *                         type: integer
 *                         example: 0
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

router
  .route("/events")
  .get(verifyRoles(ROLES_LIST.Admin), eventController.getAllEvents);

/**
 * @openapi
 * '/api/event/events/{id}':
 *   get:
 *     tags:
 *       - Events API
 *     summary: Get All Events
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the event
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */


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
