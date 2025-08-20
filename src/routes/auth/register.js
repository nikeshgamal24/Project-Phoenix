const express = require("express");
const router = express.Router();
const registerController = require("../../controllers/auth/registerController");
const { validate, authSchemas } = require("../../middleware/validation/validation");


/**
 * @openapi
 * '/api/register':
 *   post:
 *     tags:
 *       - Register Students
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - phoneNumber
 *               - program
 *               - password
 *               - confirmPassword
 *             properties:
 *               fullname:
 *                 type: string
 *                 default: "Ram Kumar"
 *               email:
 *                 type: string
 *                 default: "example.123454@ncit.edu.np"
 *               phoneNumber:
 *                 type: string
 *                 default: "9874451256"
 *               program:
 *                 type: string
 *                 default: "700"
 *               password:
 *                 type: string
 *                 default: "Password@123"
 *               confirmPassword:
 *                 type: string
 *                 default: "Password@123"
 *     responses:
 *       201:
 *         description: New User Created successfully
 *       400:
 *         description: Bad Request
 *       409:
 *         description: Duplicate Credentials
 *       500:
 *         description: Internal Server Error
 */

router.post("/", validate(authSchemas.register), registerController.handleNewUser);

module.exports = router;
