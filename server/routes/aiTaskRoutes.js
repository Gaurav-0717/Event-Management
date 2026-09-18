const express = require("express");

const { generateAITasks } = require("../controllers/aiTaskController");

const { protect } = require("../middleware/authMiddleware");

const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect);

router.post("/:eventId/generate", asyncHandler(generateAITasks));

module.exports = router;
