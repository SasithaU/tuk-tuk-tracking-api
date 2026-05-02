/**
 * Authentication Routes
 * Login, logout, token refresh, and profile management
 */

const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  refreshToken,
  getProfile,
  changePassword,
} = require("../controllers/authController");
const { verifyTokenMiddleware } = require("../middleware/auth");

// Public routes (no authentication required)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and get a token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes (authentication required)
router.use(verifyTokenMiddleware); // Apply to all routes below

router.post("/logout", logout);
router.get("/profile", getProfile);
router.post("/change-password", changePassword);

module.exports = router;
