const express = require("express");

const {
  getEventTasks,
  createEventTask,
  updateEventTask,
  completeEventTask,
  deleteEventTask,
} = require("../controllers/eventTaskController");

const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect);

// Get all tasks for an event
router.get("/:eventId/tasks", asyncHandler(getEventTasks));

// Create a new task
router.post("/:eventId/tasks", asyncHandler(createEventTask));

// Update a task
router.put("/:eventId/tasks/:taskId", asyncHandler(updateEventTask));

// Mark a task as completed
router.patch(
  "/:eventId/tasks/:taskId/complete",
  asyncHandler(completeEventTask),
);

// Delete a task
router.delete("/:eventId/tasks/:taskId", asyncHandler(deleteEventTask));

module.exports = router;
