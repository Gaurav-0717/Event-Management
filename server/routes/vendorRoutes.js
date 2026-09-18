const express = require("express");

const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");

const {
  getMatchedVendorsForEvent,
} = require("../controllers/vendorMatchingController");

const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// All vendor routes require authentication
router.use(protect);

// ============================================================
// VENDOR MATCHING
// IMPORTANT: This route must come BEFORE /:vendorId
// ============================================================

router.get("/match/:eventId", asyncHandler(getMatchedVendorsForEvent));

// ============================================================
// VENDOR CRUD
// ============================================================

router.get("/", asyncHandler(getVendors));

router.get("/:vendorId", asyncHandler(getVendorById));

router.post("/", asyncHandler(createVendor));

router.put("/:vendorId", asyncHandler(updateVendor));

router.delete("/:vendorId", asyncHandler(deleteVendor));

module.exports = router;
