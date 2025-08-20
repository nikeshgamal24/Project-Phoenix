const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth/authController");
const { validate, authSchemas } = require("../../middleware/validation/validation");
/**
 * @openapi
 * '/api/auth':
 *   post:
 *     tags:
 *       - Login API
 *     summary: Login User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 default: "example.123454@ncit.edu.np"
 *               password:
 *                 type: string
 *                 default: "Password@123"
 *               role:
 *                 type: number
 *                 default: 1253
 *     responses:
 *       200:
 *         description: Successfully login
 *         content:
 *           application/json:onst evaluators = await Evaluator.find({ role });

    if (!evaluators) {
      return res.sendStatus(204);
    }
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     role:
 *                       type: array
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                     photo:
 *                       type: string
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized User
 *       500:
 *         description: Internal Server Error
 */

router.post("/", validate(authSchemas.login), authController.handleLogin);

/**
 * @openapi
 * '/api/auth/evaluator':
 *   post:
 *     tags:
 *       - Login API
 *     summary: Evaluator Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessCode
 *               - role
 *             properties:
 *               accessCode:
 *                 type: string
 *                 default: "145236"
 *               role:
 *                 type: number
 *                 default: 1253
 *     responses:
 *       200:
 *         description: Successfully login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     contact:
 *                       type: string
 *                     role:
 *                       type: Array
 *                     isAssociated:
 *                       type: boolean
 *                     evaluatorType:
 *                       type: string
 *                     designation:
 *                       type: string
 *                     institution:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized User
 *       500:
 *         description: Internal Server Error
 */

router.post("/evaluator", validate(authSchemas.evaluatorLogin), authController.handleEvaluatorLogin);

module.exports = router;
