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
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes (authentication required)
router.use(verifyTokenMiddleware); // Apply to all routes below

router.post("/logout", logout);
router.get("/profile", getProfile);
router.post("/change-password", changePassword);

module.exports = router;
