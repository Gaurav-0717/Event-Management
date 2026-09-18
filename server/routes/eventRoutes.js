const express = require("express");
const { generateEventDossier } = require("../controllers/dossierController");

const {
  getUserEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// All event routes require authentication
router.use(protect);

// Get all events for logged-in user
router.get("/", asyncHandler(getUserEvents));

// Create a new event
router.post("/", asyncHandler(createEvent));

router.get("/:eventId/dossier", asyncHandler(generateEventDossier));

// Get one event
router.get("/:id", asyncHandler(getEventById));

// Update an event
router.put("/:id", asyncHandler(updateEvent));

// Delete an event
router.delete("/:id", asyncHandler(deleteEvent));

module.exports = router;
