const express = require("express");

const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const eventRoutes = require("./eventRoutes");
const aiPlanRoutes = require("./aiPlanRoutes");
const budgetRoutes = require("./budgetRoutes");
const eventTaskRoutes = require("./eventTaskRoutes");
const aiTaskRoutes = require("./aiTaskRoutes");
const vendorRoutes = require("./vendorRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/ai-plans", aiPlanRoutes);
router.use("/budgets", budgetRoutes);
router.use("/events", eventTaskRoutes);
router.use("/ai-tasks", aiTaskRoutes);
router.use("/vendors", vendorRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
