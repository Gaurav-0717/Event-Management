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
const { adminOnly } = require("../middleware/adminMiddleware");
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

// Vendors are global records (they have no owner field), so only admins may
// mutate them. Authenticated users can still browse and receive matches.
router.post("/", adminOnly, asyncHandler(createVendor));

router.put("/:vendorId", adminOnly, asyncHandler(updateVendor));

router.delete("/:vendorId", adminOnly, asyncHandler(deleteVendor));

module.exports = router;
