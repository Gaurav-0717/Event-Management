const express = require("express");

const { chatWithAssistant } = require("../controllers/aiAssistantController");

const { protect } = require("../middleware/authMiddleware");

const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// All AI Assistant endpoints require authentication.
router.use(protect);

// POST /api/ai-assistant/:eventId/chat
router.post("/:eventId/chat", asyncHandler(chatWithAssistant));

module.exports = router;
