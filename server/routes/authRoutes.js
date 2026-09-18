const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// POST /api/auth/register — create a new account
router.post("/register", asyncHandler(register));

// POST /api/auth/login — authenticate and receive a JWT
router.post("/login", asyncHandler(login));

// GET /api/auth/me — current authenticated user (protected)
router.get("/me", protect, asyncHandler(getMe));

module.exports = router;
