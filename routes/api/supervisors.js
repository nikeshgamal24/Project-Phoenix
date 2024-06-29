const express = require("express");
const router = express.Router();
const supervisorController = require("../../controllers/supervisorController");
const roleList = require("../../config/roleList");
const verifyRoles = require("../../middleware/verifyRoles");

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
