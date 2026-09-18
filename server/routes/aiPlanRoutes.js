const express = require("express");

const { generatePlan, getPlan } = require("../controllers/aiPlanController");

const { protect } = require("../middleware/authMiddleware");

const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// All AI plan routes require authentication
router.use(protect);

// Generate or regenerate AI plan
router.post("/:eventId/generate", asyncHandler(generatePlan));

// Get existing AI plan
router.get("/:eventId", asyncHandler(getPlan));

module.exports = router;
