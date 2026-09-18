const express = require("express");

const {
  generateBudget,
  getBudget,
  updateBudget,
} = require("../controllers/budgetController");

const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect);

// Generate / regenerate budget
router.post("/:eventId/generate", asyncHandler(generateBudget));

// Get budget
router.get("/:eventId", asyncHandler(getBudget));

// Update editable budget allocation
router.put("/:eventId", asyncHandler(updateBudget));

module.exports = router;
