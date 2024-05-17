const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController");


/**
 * @openapi
 * '/api/register':
 *   post:
 *     tags:
 *       - Register Users
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref:'#/components/schemas/Student'
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

router.post("/", registerController.handleNewUser);

module.exports = router;
