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
 *   get:
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
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "664ddd51cabc595ba1efed8c"
 *                       eventCode:
 *                         type: string
 *                         example: "ET-240201Z"
 *                       eventName:
 *                         type: string
 *                         example: "Spring-3 2024"
 *                       description:
 *                         type: string
 *                         example: "Project 3 for all students"
 *                       eventTarget:
 *                         type: string
 *                         example: "72354"
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
 *                             example: "2024-05-26T18:15:00.000Z"
 *                           reportDeadline:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-27T18:15:00.000Z"
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
 *                             example: "2024-05-26T18:15:00.000Z"
 *                           reportDeadline:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-24T18:15:00.000Z"
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
 *                             example: "2024-05-30T18:15:00.000Z"
 *                           reportDeadline:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-27T18:15:00.000Z"
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
 *                             example: "663cd63f6e8a9c42c5677775"
 *                           email:
 *                             type: string
 *                             example: "adarsh.191605@ncit.edu.np"
 *                           fullname:
 *                             type: string
 *                             example: "Adarsh Das"
 *                           phoneNumber:
 *                             type: string
 *                             example: "9854412563"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                           OTP:
 *                             type: string
 *                             example: ""
 *                           photo:
 *                             type: string
 *                             example: "https://lh3.googleusercontent.com/a/ACg8ocKaKoESPYi7B-af6iC6VEOkHzZCIjTFlv-bYTEukAoO4mAqjGc=s96-c"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-30T08:56:00.539Z"
 *                       projects:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "66501538ba52fcd2c0810fcf"
 *                             projectCode:
 *                               type: string
 *                               example: "P2-24-01RD"
 *                             projectName:
 *                               type: string
 *                               example: "Project Phoenix"
 *                             projectType:
 *                               type: string
 *                               example: "2"
 *                             projectDescription:
 *                               type: string
 *                               example: ""
 *                             teamMembers:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example:
 *                                 - "664ddb22e6e7eefa140de70c"
 *                                 - "664deec4e6e7eefa141de968"
 *                             event:
 *                               type: string
 *                               example: "664ddd51cabc595ba1efed8c"
 *                             status:
 *                               type: string
 *                               example: "101"
 *                             proposal:
 *                               type: object
 *                               properties:
 *                                 phase:
 *                                   type: string
 *                                   example: "1"
 *                                 report:
 *                                   type: object
 *                                   properties:
 *                                     filePath:
 *                                       type: string
 *                                       example: "https://res.cloudinary.com/dxc7qbvdk/image/upload/v1716558674/af0zc60yfvaan2nn5yb2.pdf"
 *                                     submittedBy:
 *                                       type: string
 *                                       example: "Adarsh Das"
 *                                     submittedOn:
 *                                       type: string
 *                                       example: "Fri May 24 2024 19:36:09 GMT+0545 (Nepal Time)"
 *                                 defenseId:
 *                                   type: string
 *                                   example: "6654b27319214015e906e250"
 *                             mid:
 *                               type: object
 *                               properties:
 *                                 phase:
 *                                   type: string
 *                                   example: "1"
 *                             final:
 *                               type: object
 *                               properties:
 *                                 phase:
 *                                   type: string
 *                                   example: "1"
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-05-24T04:19:04.656Z"
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-05-27T16:18:59.262Z"
 *                             __v:
 *                               type: integer
 *                               example: 0
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
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eligibleStudentCountForEvent:
 *                   type: integer
 *                   example: 4
 *                 data:
 *                   type: object
 *                   properties:
 *                     proposal:
 *                       type: object
 *                       properties:
 *                         defense:
 *                           type: boolean
 *                           example: true
 *                         defenseDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-05-24T18:15:00.000Z"
 *                         reportDeadline:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-05-21T18:15:00.000Z"
 *                         phase:
 *                           type: string
 *                           example: "1"
 *                     mid:
 *                       type: object
 *                       properties:
 *                         defense:
 *                           type: boolean
 *                           example: false
 *                         defenseDate:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           example: null
 *                         phase:
 *                           type: string
 *                           example: "1"
 *                     final:
 *                       type: object
 *                       properties:
 *                         defense:
 *                           type: boolean
 *                           example: true
 *                         defenseDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-05-29T18:15:00.000Z"
 *                         reportDeadline:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-05-25T18:15:00.000Z"
 *                         phase:
 *                           type: string
 *                           example: "1"
 *                     _id:
 *                       type: string
 *                       example: "664ddc89cabc595ba1efed77"
 *                     eventCode:
 *                       type: string
 *                       example: "ET-240001P"
 *                     eventName:
 *                       type: string
 *                       example: "Spring-1 2024"
 *                     description:
 *                       type: string
 *                       example: "First Project for All Students"
 *                     eventTarget:
 *                       type: string
 *                       example: "72354"
 *                     eventType:
 *                       type: string
 *                       example: "0"
 *                     eventStatus:
 *                       type: string
 *                       example: "101"
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     author:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: "adarsh.191605@ncit.edu.np"
 *                         fullname:
 *                           type: string
 *                           example: "Adarsh Das"
 *                         photo:
 *                           type: string
 *                           example: "https://lh3.googleusercontent.com/a/ACg8ocKaKoESPYi7B-af6iC6VEOkHzZCIjTFlv-bYTEukAoO4mAqjGc=s96-c"
 *                         phoneNumber:
 *                           type: string
 *                           example: "9854412563"
 *                         role:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                         OTP:
 *                           type: string
 *                           example: ""
 *                         _id:
 *                           type: string
 *                           example: "663cd63f6e8a9c42c5677775"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-05-30T08:56:00.539Z"
 *                         __v:
 *                           type: integer
 *                           example: 0
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           proposal:
 *                             type: object
 *                             properties:
 *                               hasGraduated:
 *                                 type: boolean
 *                                 example: false
 *                               evaluations:
 *                                 type: array
 *                                 items: {}
 *                               phase:
 *                                 type: string
 *                                 example: "1"
 *                           mid:
 *                             type: object
 *                             properties:
 *                               hasGraduated:
 *                                 type: boolean
 *                                 example: false
 *                               evaluations:
 *                                 type: array
 *                                 items: {}
 *                               phase:
 *                                 type: string
 *                                 example: "1"
 *                           final:
 *                             type: object
 *                             properties:
 *                               hasGraduated:
 *                                 type: boolean
 *                                 example: false
 *                               evaluations:
 *                                 type: array
 *                                 items: {}
 *                               phase:
 *                                 type: string
 *                                 example: "1"
 *                           _id:
 *                             type: string
 *                             example: "664dddddddbca618b284ce28"
 *                           projectCode:
 *                             type: string
 *                             example: "P0-24-01CJ"
 *                           projectName:
 *                             type: string
 *                             example: "Crowdfundr."
 *                           projectType:
 *                             type: string
 *                             example: "0"
 *                           projectDescription:
 *                             type: string
 *                             example: "Transparent fund raiser"
 *                           teamMembers:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: "664ddd78ddbca618b284ce15"
 *                                 fullname:
 *                                   type: string
 *                                   example: "Goku Saiyan"
 *                                 email:
 *                                   type: string
 *                                   example: "goku.211819@ncit.edu.np"
 *                                 rollNumber:
 *                                   type: integer
 *                                   example: 211819
 *                                 batchNumber:
 *                                   type: integer
 *                                   example: 2021
 *                                 isAssociated:
 *                                   type: boolean
 *                                   example: true
 *                                 progressStatus:
 *                                   type: string
 *                                   example: "0001"
 *                                 phoneNumber:
 *                                   type: string
 *                                   example: "9874458965"
 *                                 program:
 *                                   type: integer
 *                                   example: 200
 *                                 role:
 *                                   type: array
 *                                   items:
 *                                     type: integer
 *                                     example: 2001
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                   example: "2024-05-22T11:56:40.312Z"
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                                   example: "2024-05-25T10:50:43.379Z"
 *                                 __v:
 *                                   type: integer
 *                                   example: 0
 *                                 project:
 *                                   type: string
 *                                   example: "664dddddddbca618b284ce28"
 *                           event:
 *                             type: string
 *                             example: "664ddc89cabc595ba1efed77"
 *                           status:
 *                             type: string
 *                             example: "101"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-22T11:58:21.511Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-05-22T11:58:46.586Z"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-22T11:52:41.828Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-23T14:21:35.561Z"
 *                     __v:
 *                       type: integer
 *                       example: 2
 *                 defenses:
 *                   type: array
 *                   items: {}
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
