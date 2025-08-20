const express = require("express");
const router = express.Router();
const supervisorController = require("../../controllers/api/supervisorController");
const roleList = require("../../config/constants/roles");
const verifyRoles = require("../../middleware/auth/verifyRoles");

/**
 * @openapi
 * '/api/supervisor/supervisors/{id}':
 *   put:
 *     tags:
 *       - Supervisor API
 *     summary: Update Supervisor Field
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of supervisor
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "9632258741"
 *               designation:
 *                 type: string
 *                 example: "assistant professor"
 *               institution:
 *                 type: string
 *                 example: "GCES"
 *               skillSet:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "Django", "Postgres", "AI"]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "667bc15dd8c0db0b78156534"
 *                     email:
 *                       type: string
 *                       example: "adarsh.191605@ncit.edu.np"
 *                     __v:
 *                       type: integer
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-26T07:21:00.792Z"
 *                     fullname:
 *                       type: string
 *                       example: "Adarsh Das"
 *                     isAvailable:
 *                       type: boolean
 *                       example: true
 *                     photo:
 *                       type: string
 *                       example: "https://lh3.googleusercontent.com/a/ACg8ocKaKoESPYi7B-af6iC6VEOkHzZCIjTFlv-bYTEukAoO4mAqjGc=s96-c"
 *                     skillSet:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["React", "Django", "Postgres", "AI"]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-29T16:18:43.829Z"
 *                     designation:
 *                       type: string
 *                       example: "assistant professor"
 *                     institution:
 *                       type: string
 *                       example: "GCES"
 *                     phoneNumber:
 *                       type: string
 *                       example: "9632258741"
 *                     projectId:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 */

router
  .route("/supervisors/:id")
  .put(verifyRoles(roleList.Supervisor), supervisorController.updateSupervisor);

/**
 * @openapi
 * '/api/supervisor/projects/active':
 *   get:
 *     tags:
 *       - Supervisor API
 *     summary: Get All Active Projects of Supervisor
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       supervisor:
 *                         type: object
 *                         properties:
 *                           mid:
 *                             type: object
 *                             properties:
 *                               approved:
 *                                 type: boolean
 *                               approvedDate:
 *                                 type: string
 *                                 format: date-time
 *                           final:
 *                             type: object
 *                             properties:
 *                               approved:
 *                                 type: boolean
 *                               approvedDate:
 *                                 type: string
 *                                 format: date-time
 *                           supervisorId:
 *                             type: string
 *                             description: Supervisor ID
 *                       proposal:
 *                         type: object
 *                         properties:
 *                           report:
 *                             type: object
 *                             properties:
 *                               filePath:
 *                                 type: string
 *                                 format: uri
 *                               submittedBy:
 *                                 type: string
 *                               submittedOn:
 *                                 type: string
 *                                 format: date-time
 *                           hasGraduated:
 *                             type: boolean
 *                           evaluations:
 *                             type: array
 *                             items:
 *                               type: string
 *                           defenses:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 defense:
 *                                   type: string
 *                                 evaluators:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       evaluator:
 *                                         type: string
 *                                       hasEvaluated:
 *                                         type: boolean
 *                                       _id:
 *                                         type: string
 *                                 isGraded:
 *                                   type: boolean
 *                                 _id:
 *                                   type: string
 *                       mid:
 *                         type: object
 *                         properties:
 *                           report:
 *                             type: object
 *                             properties:
 *                               filePath:
 *                                 type: string
 *                                 format: uri
 *                               submittedBy:
 *                                 type: string
 *                               submittedOn:
 *                                 type: string
 *                                 format: date-time
 *                           hasGraduated:
 *                             type: boolean
 *                           evaluations:
 *                             type: array
 *                             items:
 *                               type: string
 *                           defenses:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 defense:
 *                                   type: string
 *                                 evaluators:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       evaluator:
 *                                         type: string
 *                                       hasEvaluated:
 *                                         type: boolean
 *                                       _id:
 *                                         type: string
 *                                 isGraded:
 *                                   type: boolean
 *                                 _id:
 *                                   type: string
 *                       final:
 *                         type: object
 *                         properties:
 *                           hasGraduated:
 *                             type: boolean
 *                           evaluations:
 *                             type: array
 *                             items:
 *                               type: string
 *                           defenses:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 defense:
 *                                   type: string
 *                                 evaluators:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       evaluator:
 *                                         type: string
 *                                       hasEvaluated:
 *                                         type: boolean
 *                                       _id:
 *                                         type: string
 *                                 isGraded:
 *                                   type: boolean
 *                                 _id:
 *                                   type: string
 *                       _id:
 *                         type: string
 *                         description: Project ID
 *                       projectCode:
 *                         type: string
 *                       projectName:
 *                         type: string
 *                       projectType:
 *                         type: string
 *                       projectDescription:
 *                         type: string
 *                       teamMembers:
 *                         type: array
 *                         items:
 *                           type: string
 *                       event:
 *                         type: string
 *                       status:
 *                         type: string
 *                       progressLogs:
 *                         type: array
 *                         items:
 *                           type: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       __v:
 *                         type: integer
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 */

router
  .route("/projects/active")
  .get(
    verifyRoles(roleList.Supervisor),
    supervisorController.getAllActiveProjects
  );

/**
 * @openapi
 * '/api/supervisor/projects/archive':
 *   get:
 *     tags:
 *       - Supervisor API
 *     summary: Get All Archive Projects of Supervisor
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       supervisor:
 *                         type: object
 *                         properties:
 *                           mid:
 *                             type: object
 *                             properties:
 *                               approved:
 *                                 type: boolean
 *                                 example: true
 *                               approvedDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-06-30T06:34:48.884Z"
 *                           final:
 *                             type: object
 *                             properties:
 *                               approved:
 *                                 type: boolean
 *                                 example: true
 *                               approvedDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-06-30T08:08:18.445Z"
 *                           supervisorId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "667ba51ab7f6a19c307370de"
 *                               fullname:
 *                                 type: string
 *                                 example: "Nikesh Gamal"
 *                               email:
 *                                 type: string
 *                                 example: "nikesh.191624@ncit.edu.np"
 *                               phoneNumber:
 *                                 type: string
 *                                 example: "9632258741"
 *                               role:
 *                                 type: array
 *                                 items:
 *                                   type: integer
 *                                   example: 1984
 *                               isAvailable:
 *                                 type: boolean
 *                                 example: true
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-06-26T05:20:26.735Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-07-01T13:40:34.756Z"
 *                               __v:
 *                                 type: integer
 *                                 example: 0
 *                               photo:
 *                                 type: string
 *                                 example: "https://lh3.googleusercontent.com/a/ACg8ocIfXPQaBjP6VTLLG3HfrhvLWMlocO6G09-PGOUrKlMAwkF0cDk=s96-c"
 *                               designation:
 *                                 type: string
 *                                 example: "professor"
 *                               institution:
 *                                 type: string
 *                                 example: "NCIT"
 *                               skillSet:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                   example: "Web Dev"
 *                       proposal:
 *                         type: object
 *                         properties:
 *                           report:
 *                             type: object
 *                             properties:
 *                               filePath:
 *                                 type: string
 *                                 example: "https://res.cloudinary.com/dxc7qbvdk/image/upload/v1719728598/iegyio8lqsr93raj0nwe.pdf"
 *                               submittedBy:
 *                                 type: string
 *                                 example: "Student Seven"
 *                               submittedOn:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "Sun Jun 30 2024 12:08:17 GMT+0545 (Nepal Time)"
 *                           hasGraduated:
 *                             type: boolean
 *                             example: true
 *                           evaluations:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "6680f95815830fd3a7245ae0"
 *                           defenses:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 defense:
 *                                   type: string
 *                                   example: "6680f71d2d2048b29d67a559"
 *                                 evaluators:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       evaluator:
 *                                         type: string
 *                                         example: "66589150f724c54d4766a4a1"
 *                                       hasEvaluated:
 *                                         type: boolean
 *                                         example: true
 *                                       _id:
 *                                         type: string
 *                                         example: "6680f71e2d2048b29d67a569"
 *                                 isGraded:
 *                                   type: boolean
 *                                   example: true
 *                       mid:
 *                         type: object
 *                         properties:
 *                           report:
 *                             type: object
 *                             properties:
 *                               filePath:
 *                                 type: string
 *                                 example: "https://res.cloudinary.com/dxc7qbvdk/image/upload/v1719733752/y5o2vodd3uzye6aujbbl.pdf"
 *                               submittedBy:
 *                                 type: string
 *                                 example: "Student Seven"
 *                               submittedOn:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "Sun Jun 30 2024 13:34:10 GMT+0545 (Nepal Time)"
 *                           hasGraduated:
 *                             type: boolean
 *                             example: true
 *                           evaluations:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "66811056e9ba6da9e2da13f0"
 *                           defenses:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 defense:
 *                                   type: string
 *                                   example: "66810e33e05af29200c96371"
 *                                 evaluators:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       evaluator:
 *                                         type: string
 *                                         example: "66589161f724c54d4766a4a6"
 *                                       hasEvaluated:
 *                                         type: boolean
 *                                         example: true
 *                                       _id:
 *                                         type: string
 *                                         example: "66810e35e05af29200c96398"
 *                                 isGraded:
 *                                   type: boolean
 *                                   example: true
 *                       final:
 *                         type: object
 *                         properties:
 *                           report:
 *                             type: object
 *                             properties:
 *                               filePath:
 *                                 type: string
 *                                 example: "https://res.cloudinary.com/dxc7qbvdk/image/upload/v1719735127/ikz3qrkivighrwovblwm.pdf"
 *                               submittedBy:
 *                                 type: string
 *                                 example: "Student Seven"
 *                               submittedOn:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "Sun Jun 30 2024 13:57:05 GMT+0545 (Nepal Time)"
 *                           hasGraduated:
 *                             type: boolean
 *                             example: true
 *                           evaluations:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "66811432aa27f48f51d55205"
 *                           defenses:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 defense:
 *                                   type: string
 *                                   example: "668113adaa27f48f51d54c85"
 *                                 evaluators:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       evaluator:
 *                                         type: string
 *                                         example: "66589161f724c54d4766a4a6"
 *                                       hasEvaluated:
 *                                         type: boolean
 *                                         example: true
 *                                       _id:
 *                                         type: string
 *                                         example: "668113aeaa27f48f51d54c9f"
 *                                 isGraded:
 *                                   type: boolean
 *                                   example: true
 *                       _id:
 *                         type: string
 *                         example: "6680f6ca2d2048b29d67a522"
 *                       projectCode:
 *                         type: string
 *                         example: "P2-19-05BCA"
 *                       projectName:
 *                         type: string
 *                         example: "project seven"
 *                       projectType:
 *                         type: string
 *                         example: "2"
 *                       projectDescription:
 *                         type: string
 *                         example: "dsfsfdf"
 *                       teamMembers:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "6680f2fb0fb31d34018283dc"
 *                       event:
 *                         type: string
 *                         example: "6680f5f015830fd3a72457e0"
 *                       status:
 *                         type: string
 *                         example: "105"
 *                       progressLogs:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "6680fc6215830fd3a7245f34"
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "Web Dev"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-30T06:10:18.083Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-06-30T08:16:00.833Z"
 *                       __v:
 *                         type: integer
 *                         example: 15
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 */

router
  .route("/projects/archive")
  .get(
    verifyRoles(roleList.Supervisor),
    supervisorController.getAllArchiveProjects
  );

/**
 * @openapi
 * '/api/supervisor/project/{id}':
 *   get:
 *     tags:
 *       - Supervisor API
 *     summary: Get Project By Id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of supervisor
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 */

router
  .route("/project/:id")
  .get(verifyRoles(roleList.Supervisor), supervisorController.getProjectById);

/**
 * @openapi
 * '/api/supervisor/events/active':
 *   get:
 *     tags:
 *       - Supervisor API
 *     summary: Get Active Evnets
 *     responses:
 *       '200':
 *         description: OK
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 */
router
  .route("/events/active")
  .get(
    verifyRoles(roleList.Supervisor),
    supervisorController.getAllActiveEvents
  );

/**
 * @openapi
 * '/api/supervisor/supervisor/availability':
 *   post:
 *     tags:
 *       - Supervisor API
 *     summary: Update the supervisor availability
 *     responses:
 *       '200':
 *         description: OK
 *       400:
 *         description: Bad Request
 */
router
  .route("/supervisor/availability")
  .post(
    verifyRoles(roleList.Supervisor),
    supervisorController.toogleAvailabilityOfSupervisor
  );

/**
 * @openapi
 * '/api/supervisor/supervisor/progress-log/verify/{id}':
 *   post:
 *     tags:
 *       - Supervisor API
 *     summary: Verify the Progress logs 
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of supervisor
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 */
router
  .route("/supervisor/progress-log/verify/:id")
  .post(
    verifyRoles(roleList.Supervisor),
    supervisorController.progressLogVerify
  );


/**
 * @openapi
 * '/api/supervisor/supervisor/progress-log/grant-approval/{id}':
 *   post:
 *     tags:
 *       - Supervisor API
 *     summary: Grant project for the upcomming defense
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of supervisor
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 *       409:
 *         description: Conflict Data
 */
router
  .route("/supervisor/progress-log/grant-approval/:id")
  .post(
    verifyRoles(roleList.Supervisor),
    supervisorController.progressLogApprovalGrant
  );

module.exports = router;
