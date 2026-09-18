const express = require("express");

const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllEvents,
  deleteAdminEvent,
  getAllVendors,
  updateAdminVendor,
  deleteAdminVendor,
  getAIPlanStats,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Dashboard
router.get("/stats", asyncHandler(getAdminStats));

// Users
router.get("/users", asyncHandler(getAllUsers));

router.put("/users/:userId/role", asyncHandler(updateUserRole));

router.delete("/users/:userId", asyncHandler(deleteUser));

// Events
router.get("/events", asyncHandler(getAllEvents));

router.delete("/events/:eventId", asyncHandler(deleteAdminEvent));

// Vendors
router.get("/vendors", asyncHandler(getAllVendors));

router.put("/vendors/:vendorId", asyncHandler(updateAdminVendor));

router.delete("/vendors/:vendorId", asyncHandler(deleteAdminVendor));

// AI Plans
router.get("/ai-plans", asyncHandler(getAIPlanStats));

module.exports = router;
