const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../../config/constants/roles");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const evaluatorController = require("../../controllers/api/evaluatorController");

/**
 * @openapi
 * '/api/evaluator/defense/{id}':
 *   get:
 *     tags:
 *       - Evaluator API
 *     summary: Get Defense By Id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the defense
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ok
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
 *                     event:
 *                       type: object
 *                       properties:
 *                         proposal:
 *                           type: object
 *                           properties:
 *                             defense:
 *                               type: boolean
 *                             defenseDate:
 *                               type: string
 *                               format: date-time
 *                             reportDeadline:
 *                               type: string
 *                               format: date-time
 *                             defenseId:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             phase:
 *                               type: string
 *                         mid:
 *                           type: object
 *                           properties:
 *                             defense:
 *                               type: boolean
 *                             defenseDate:
 *                               type: string
 *                               format: date-time
 *                             reportDeadline:
 *                               type: string
 *                               format: date-time
 *                             defenseId:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             phase:
 *                               type: string
 *                         final:
 *                           type: object
 *                           properties:
 *                             defense:
 *                               type: boolean
 *                             defenseDate:
 *                               type: string
 *                               format: date-time
 *                             reportDeadline:
 *                               type: string
 *                               format: date-time
 *                             defenseId:
 *                               type: array
 *                               items:
 *                                 type: string
 *                             phase:
 *                               type: string
 *                         _id:
 *                           type: string
 *                         eventCode:
 *                           type: string
 *                         eventName:
 *                           type: string
 *                         description:
 *                           type: string
 *                         eventTarget:
 *                           type: string
 *                         eventType:
 *                           type: string
 *                         eventStatus:
 *                           type: string
 *                         year:
 *                           type: integer
 *                         author:
 *                           type: string
 *                         projects:
 *                           type: array
 *                           items:
 *                             type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                         __v:
 *                           type: integer
 *                     defenseType:
 *                       type: string
 *                     defenseTime:
 *                       type: string
 *                       format: date-time
 *                     defenseDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                     rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           room:
 *                             type: string
 *                           evaluators:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 fullname:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 contact:
 *                                   type: string
 *                                 role:
 *                                   type: array
 *                                   items:
 *                                     type: integer
 *                                 isAssociated:
 *                                   type: boolean
 *                                 evaluatorType:
 *                                   type: string
 *                                 designation:
 *                                   type: string
 *                                 institution:
 *                                   type: string
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                                 __v:
 *                                   type: integer
 *                                 defense:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       defenseId:
 *                                         type: string
 *                                       accessCode:
 *                                         type: string
 *                                       _id:
 *                                         type: string
 *                                 currentDefense:
 *                                   type: string
 *                                 refreshToken:
 *                                   type: string
 *                           projects:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 proposal:
 *                                   type: object
 *                                   properties:
 *                                     report:
 *                                       type: object
 *                                       properties:
 *                                         filePath:
 *                                           type: string
 *                                         submittedBy:
 *                                           type: string
 *                                         submittedOn:
 *                                           type: string
 *                                           format: date-time
 *                                     defenseId:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                     hasGraduated:
 *                                       type: boolean
 *                                     evaluations:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                 mid:
 *                                   type: object
 *                                   properties:
 *                                     defenseId:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                     hasGraduated:
 *                                       type: boolean
 *                                     evaluations:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                 final:
 *                                   type: object
 *                                   properties:
 *                                     defenseId:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                     hasGraduated:
 *                                       type: boolean
 *                                     evaluations:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                 _id:
 *                                   type: string
 *                                 projectCode:
 *                                   type: string
 *                                 projectName:
 *                                   type: string
 *                                 projectType:
 *                                   type: string
 *                                 projectDescription:
 *                                   type: string
 *                                 teamMembers:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                 event:
 *                                   type: string
 *                                 status:
 *                                   type: string
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                                 __v:
 *                                   type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           __v:
 *                             type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     __v:
 *                       type: integer
 *             examples:
 *               example1:
 *                 value:
 *                   data:
 *                     _id: "665f0913607414761fff0e30"
 *                     event:
 *                       proposal:
 *                         defense: true
 *                         defenseDate: "2024-06-08T18:14:59.000Z"
 *                         reportDeadline: "2024-06-04T18:14:59.000Z"
 *                         defenseId:
 *                           - "665f0913607414761fff0e30"
 *                         phase: "1"
 *                       mid:
 *                         defense: true
 *                         defenseDate: "2024-06-15T18:14:59.000Z"
 *                         reportDeadline: "2024-06-12T18:14:59.000Z"
 *                         defenseId: []
 *                         phase: "1"
 *                       final:
 *                         defense: true
 *                         defenseDate: "2024-06-22T18:14:59.000Z"
 *                         reportDeadline: "2024-06-15T18:14:59.000Z"
 *                         defenseId: []
 *                         phase: "1"
 *                       _id: "665f074df46f0f443394e6eb"
 *                       eventCode: "M-19-0201W"
 *                       eventName: "Spring-3 2024"
 *                       description: "Major project for all students"
 *                       eventTarget: "72354"
 *                       eventType: "2"
 *                       eventStatus: "101"
 *                       year: 2024
 *                       author: "663cd63f6e8a9c42c5677775"
 *                       projects:
 *                         - "665f07b2a87ff6facc1d9713"
 *                       createdAt: "2024-06-04T12:23:41.813Z"
 *                       updatedAt: "2024-06-04T12:31:16.200Z"
 *                       __v: 2
 *                     defenseType: "proposal"
 *                     defenseTime: "2024-06-04T05:15:00.000Z"
 *                     defenseDate: "2024-06-08T18:14:59.000Z"
 *                     status: "101"
 *                     rooms:
 *                       - _id: "665f0913607414761fff0e2e"
 *                         room: "A202"
 *                         evaluators:
 *                           - _id: "66589161f724c54d4766a4a6"
 *                             fullname: "Bhide Master"
 *                             email: "adarsh.191605@ncit.edu.np"
 *                             contact: "9818576955"
 *                             role:
 *                               - 4334
 *                             isAssociated: false
 *                             evaluatorType: "88"
 *                             designation: "Asst. Professor"
 *                             institution: "NCIT"
 *                             createdAt: "2024-05-30T14:46:57.003Z"
 *                             updatedAt: "2024-06-04T12:32:46.977Z"
 *                             __v: 26
 *                             defense:
 *                               - defenseId: "665f0913607414761fff0e30"
 *                                 accessCode: "$2b$10$bdLguuH9Q2vxc///IWFZeu.FdVm95Zo2qDQghs8/F9e/fLU/nfuVS"
 *                                 _id: "665f0914607414761fff0e35"
 *                             currentDefense: "665f0913607414761fff0e30"
 *                             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkYXJzaC4xOTE2MDVAbmNpdC5lZHUubnAiLCJpYXQiOjE3MTc1MDQzNjYsImV4cCI6MTcxNzU5MDc2Nn0.H_84z8aiT5kM6q3yAWiUaMeFOSbLSVV4iIFlImn0CZU"
 *                         projects:
 *                           - proposal:
 *                               report:
 *                                 filePath: "https://res.cloudinary.com/dxc7qbvdk/image/upload/v1717503970/rufxoiobf0mlufgpfk3p.pdf"
 *                                 submittedBy: "Adarsh Das"
 *                                 submittedOn: "Tue Jun 04 2024 18:11:08 GMT+0545 (Nepal Time)"
 *                               defenseId:
 *                                 - "665f0913607414761fff0e30"
 *                               hasGraduated: false
 *                               evaluations: []
 *                             mid:
 *                               defenseId: []
 *                               hasGraduated: false
 *                               evaluations: []
 *                             final:
 *                               defenseId: []
 *                               hasGraduated: false
 *                               evaluations: []
 *                             _id: "665f07b2a87ff6facc1d9713"
 *                             projectCode: "P2-19-01SE"
 *                             projectName: "Project Phoenix"
 *                             projectType: "2"
 *                             projectDescription: "LMS killer"
 *                             teamMembers:
 *                               - "665aba9a5e5b26d797e8c742"
 *                               - "665ab37c5e5b26d797e5f0b7"
 *                             event: "665f074df46f0f443394e6eb"
 *                             status: "101"
 *                             createdAt: "2024-06-04T12:25:22.232Z"
 *                             updatedAt: "2024-06-04T12:31:16.593Z"
 *                             __v: 1
 *                         createdAt: "2024-06-04T12:31:15.596Z"
 *                         updatedAt: "2024-06-04T12:31:15.596Z"
 *                         __v: 0
 *                     createdAt: "2024-06-04T12:31:15.809Z"
 *                     updatedAt: "2024-06-04T12:31:15.809Z"
 *                     __v: 0
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

router
  .route("/defense/:id")
  .get(verifyRoles(ROLES_LIST.Evaluator), evaluatorController.getDefenseBydId);

/**
 * @openapi
 * '/api/evaluator/defense/project/{id}':
 *   get:
 *     tags:
 *       - Evaluator API
 *     summary: Get Project By Id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the Project
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     proposal:
 *                       type: object
 *                       properties:
 *                         report:
 *                           type: object
 *                           properties:
 *                             filePath:
 *                               type: string
 *                               example: "https://res.cloudinary.com/dxc7qbvdk/image/upload/v1717503970/rufxoiobf0mlufgpfk3p.pdf"
 *                             submittedBy:
 *                               type: string
 *                               example: "Adarsh Das"
 *                             submittedOn:
 *                               type: string
 *                               format: date-time
 *                               example: "Tue Jun 04 2024 18:11:08 GMT+0545 (Nepal Time)"
 *                         defenseId:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["665f0913607414761fff0e30"]
 *                         hasGraduated:
 *                           type: boolean
 *                           example: false
 *                         evaluations:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                     mid:
 *                       type: object
 *                       properties:
 *                         defenseId:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                         hasGraduated:
 *                           type: boolean
 *                           example: false
 *                         evaluations:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                     final:
 *                       type: object
 *                       properties:
 *                         defenseId:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                         hasGraduated:
 *                           type: boolean
 *                           example: false
 *                         evaluations:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                     _id:
 *                       type: string
 *                       example: "665f07b2a87ff6facc1d9713"
 *                     projectCode:
 *                       type: string
 *                       example: "P2-19-01SE"
 *                     projectName:
 *                       type: string
 *                       example: "Project Phoenix"
 *                     projectType:
 *                       type: string
 *                       example: "2"
 *                     projectDescription:
 *                       type: string
 *                       example: "LMS killer"
 *                     teamMembers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "665aba9a5e5b26d797e8c742"
 *                           email:
 *                             type: string
 *                             example: "adarsh.191605@ncit.edu.np"
 *                           __v:
 *                             type: integer
 *                             example: 0
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-06-01T06:07:22.274Z"
 *                           fullname:
 *                             type: string
 *                             example: "Adarsh Das"
 *                           isAssociated:
 *                             type: boolean
 *                             example: true
 *                           photo:
 *                             type: string
 *                             example: "https://lh3.googleusercontent.com/a/ACg8ocKaKoESPYi7B-af6iC6VEOkHzZCIjTFlv-bYTEukAoO4mAqjGc=s96-c"
 *                           refreshToken:
 *                             type: string
 *                             example: ""
 *                           role:
 *                             type: array
 *                             items:
 *                               type: integer
 *                             example: [2001]
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-06-04T12:46:58.363Z"
 *                           batchNumber:
 *                             type: integer
 *                             example: 2019
 *                           progressStatus:
 *                             type: string
 *                             example: "2002"
 *                           rollNumber:
 *                             type: integer
 *                             example: 191605
 *                           phoneNumber:
 *                             type: string
 *                             example: "9818576955"
 *                           program:
 *                             type: integer
 *                             example: 700
 *                           project:
 *                             type: string
 *                             example: "665f07b2a87ff6facc1d9713"
 *                       example:
 *                         - _id: "665aba9a5e5b26d797e8c742"
 *                           email: "adarsh.191605@ncit.edu.np"
 *                           __v: 0
 *                           createdAt: "2024-06-01T06:07:22.274Z"
 *                           fullname: "Adarsh Das"
 *                           isAssociated: true
 *                           photo: "https://lh3.googleusercontent.com/a/ACg8ocKaKoESPYi7B-af6iC6VEOkHzZCIjTFlv-bYTEukAoO4mAqjGc=s96-c"
 *                           refreshToken: ""
 *                           role: [2001]
 *                           updatedAt: "2024-06-04T12:46:58.363Z"
 *                           batchNumber: 2019
 *                           progressStatus: "2002"
 *                           rollNumber: 191605
 *                           phoneNumber: "9818576955"
 *                           program: 700
 *                           project: "665f07b2a87ff6facc1d9713"
 *                         - _id: "665ab37c5e5b26d797e5f0b7"
 *                           email: "nikesh.191624@ncit.edu.np"
 *                           __v: 0
 *                           createdAt: "2024-06-01T05:37:00.245Z"
 *                           fullname: "Nikesh Gamal"
 *                           isAssociated: true
 *                           photo: "https://lh3.googleusercontent.com/a/ACg8ocIfXPQaBjP6VTLLG3HfrhvLWMlocO6G09-PGOUrKlMAwkF0cDk=s96-c"
 *                           refreshToken: ""
 *                           role: [2001]
 *                           updatedAt: "2024-06-04T12:26:10.878Z"
 *                           batchNumber: 2019
 *                           progressStatus: "2002"
 *                           rollNumber: 191624
 *                           phoneNumber: "9874456325"
 *                           program: 700
 *                           project: "665f07b2a87ff6facc1d9713"
 *                     event:
 *                       type: object
 *                       properties:
 *                         proposal:
 *                           type: object
 *                           properties:
 *                             defense:
 *                               type: boolean
 *                               example: true
 *                             defenseDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-08T18:14:59.000Z"
 *                             reportDeadline:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-04T18:14:59.000Z"
 *                             defenseId:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["665f0913607414761fff0e30"]
 *                             phase:
 *                               type: string
 *                               example: "1"
 *                         mid:
 *                           type: object
 *                           properties:
 *                             defense:
 *                               type: boolean
 *                               example: true
 *                             defenseDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-15T18:14:59.000Z"
 *                             reportDeadline:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-12T18:14:59.000Z"
 *                             defenseId:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: []
 *                             phase:
 *                               type: string
 *                               example: "1"
 *                         final:
 *                           type: object
 *                           properties:
 *                             defense:
 *                               type: boolean
 *                               example: true
 *                             defenseDate:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-22T18:14:59.000Z"
 *                             reportDeadline:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-15T18:14:59.000Z"
 *                             defenseId:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: []
 *                             phase:
 *                               type: string
 *                               example: "1"
 *                         _id:
 *                           type: string
 *                           example: "665f074df46f0f443394e6eb"
 *                         eventCode:
 *                           type: string
 *                           example: "M-19-0201W"
 *                         eventName:
 *                           type: string
 *                           example: "Spring-3 2024"
 *                         description:
 *                           type: string
 *                           example: "Major project for all students"
 *                         eventTarget:
 *                           type: string
 *                           example: "72354"
 *                         eventType:
 *                           type: string
 *                           example: "2"
 *                         eventStatus:
 *                           type: string
 *                           example: "101"
 *                         year:
 *                           type: integer
 *                           example: 2024
 *                         author:
 *                           type: string
 *                           example: "663cd63f6e8a9c42c5677775"
 *                         projects:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["665f07b2a87ff6facc1d9713"]
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-06-04T12:23:41.813Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-06-04T12:31:16.200Z"
 *                         __v:
 *                           type: integer
 *                           example: 2
 *                     status:
 *                       type: string
 *                       example: "101"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-04T12:25:22.232Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-06-04T12:31:16.593Z"
 *                     __v:
 *                       type: integer
 *                       example: 1
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

router
  .route("/defense/project/:id")
  .get(verifyRoles(ROLES_LIST.Evaluator), evaluatorController.getProjectBydId);

// router
//   .route("/defense/evaluation")
//   .post(verifyRoles(ROLES_LIST.Evaluator), evaluatorController.submitEvaluation);


/**
 * @openapi
 * '/api/evaluator/defense/evaluation':
 *   post:
 *     tags:
 *       - Evaluator API
 *     summary: submit defense evaluation
 *     responses:
 *       200:
 *         description: Ok
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router
  .route("/defense/evaluation")
  .post(verifyRoles(ROLES_LIST.Evaluator), evaluatorController.submitEvaluation);

module.exports = router; 
