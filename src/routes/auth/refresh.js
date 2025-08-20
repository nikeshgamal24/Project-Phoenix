const express = require("express");
const router = express.Router();
const refreshTokenController = require("../../controllers/auth/refreshTokenController");

    /**
     * @openapi
     * '/api/refresh':
     *   get:
     *     tags:
     *       - Refresh
     *     summary: Refresh Token
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
     *       403:
     *         description: Forbidden
     *       500:
     *         description: Internal Server Error
     */

router.get("/", refreshTokenController.handleRefreshToken);

module.exports = router;
