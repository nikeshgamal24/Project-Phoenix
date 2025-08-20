const express = require("express");
const router = express.Router();
const logoutController = require("../../controllers/auth/logoutController");

/**
 * @openapi
 * '/api/logout':
 *   get:
 *     tags:
 *       - Logout
 *     summary: Logout
 *     responses:
 *       204:
 *         description: No Content
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 */

router.get("/", logoutController.handleLogout);

module.exports = router;
