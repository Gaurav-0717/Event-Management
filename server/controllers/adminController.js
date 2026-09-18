const mongoose = require("mongoose");

const User = require("../models/User");
const Event = require("../models/Event");
const Vendor = require("../models/Vendor");
const EventPlan = require("../models/EventPlan");
const EventTask = require("../models/EventTask");

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalEvents,
      totalVendors,
      activeVendors,
      totalAIPlans,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "admin" }),
      Event.countDocuments({}),
      Vendor.countDocuments({}),
      Vendor.countDocuments({ isActive: true }),
      EventPlan.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalEvents,
        totalVendors,
        activeVendors,
        totalAIPlans,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:userId/role
 * @access  Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400);
      return next(new Error("Invalid user ID."));
    }

    // Validate role
    if (!["user", "admin"].includes(role)) {
      res.status(400);
      return next(new Error("Role must be either 'user' or 'admin'."));
    }

    // Find target user
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      return next(new Error("User not found."));
    }

    // Prevent admin from changing their own role
    if (String(user._id) === String(req.user._id)) {
      res.status(400);
      return next(new Error("You cannot change your own administrator role."));
    }

    // Prevent removing the last administrator
    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        res.status(400);
        return next(new Error("The last administrator cannot be demoted."));
      }
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        role === "admin"
          ? "User promoted to administrator."
          : "Administrator demoted to regular user.",
      user: user.toSafeJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Delete user and related event data
 * @route   DELETE /api/admin/users/:userId
 * @access  Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400);
      return next(new Error("Invalid user ID."));
    }

    // Prevent deleting yourself
    if (String(userId) === String(req.user._id)) {
      res.status(400);
      return next(
        new Error("You cannot delete your own administrator account."),
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      return next(new Error("User not found."));
    }

    // Prevent deleting the last administrator
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        res.status(400);
        return next(
          new Error("The last administrator account cannot be deleted."),
        );
      }
    }

    // Find events owned by the user
    const userEvents = await Event.find({
      user: user._id,
    }).select("_id");

    const eventIds = userEvents.map((event) => event._id);

    // Remove tasks belonging to those events
    if (eventIds.length > 0) {
      await EventTask.deleteMany({
        event: { $in: eventIds },
      });
    }

    // Remove AI plans belonging to those events
    if (eventIds.length > 0) {
      await EventPlan.deleteMany({
        event: { $in: eventIds },
      });
    }

    // Remove events owned by user
    await Event.deleteMany({
      user: user._id,
    });

    // Finally remove user
    await User.deleteOne({
      _id: user._id,
    });

    return res.status(200).json({
      success: true,
      message: "User and related event data deleted successfully.",
      deletedUserId: user._id,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all events
 * @route   GET /api/admin/events
 * @access  Admin
 */
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all vendors
 * @route   GET /api/admin/vendors
 * @access  Admin
 */
const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get AI plan statistics
 * @route   GET /api/admin/ai-plans
 * @access  Admin
 */
const getAIPlanStats = async (req, res, next) => {
  try {
    const totalPlans = await EventPlan.countDocuments({});

    const recentPlans = await EventPlan.find({})
      .populate("event", "title eventType eventDate")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      totalPlans,
      recentPlans,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Delete event and related planning data
 * @route   DELETE /api/admin/events/:eventId
 * @access  Admin
 */
const deleteAdminEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400);
      return next(new Error("Invalid event ID."));
    }

    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404);
      return next(new Error("Event not found."));
    }

    // Delete related timeline/checklist tasks
    await EventTask.deleteMany({
      event: event._id,
    });

    // Delete related AI event plan
    await EventPlan.deleteMany({
      event: event._id,
    });

    // Delete the event itself
    await Event.deleteOne({
      _id: event._id,
    });

    return res.status(200).json({
      success: true,
      message: "Event and related planning data deleted successfully.",
      deletedEventId: event._id,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update vendor
 * @route   PUT /api/admin/vendors/:vendorId
 * @access  Admin
 */
const updateAdminVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      res.status(400);
      return next(new Error("Invalid vendor ID."));
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      res.status(404);
      return next(new Error("Vendor not found."));
    }

    const allowedFields = [
      "name",
      "description",
      "category",
      "city",
      "area",
      "address",
      "eventTypes",
      "minGuests",
      "maxGuests",
      "minBudget",
      "maxBudget",
      "currency",
      "services",
      "styles",
      "foodTypes",
      "entertainmentTypes",
      "phone",
      "email",
      "website",
      "rating",
      "reviewCount",
      "available",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        vendor[field] = req.body[field];
      }
    });

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully.",
      vendor,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Delete vendor
 * @route   DELETE /api/admin/vendors/:vendorId
 * @access  Admin
 */
const deleteAdminVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      res.status(400);
      return next(new Error("Invalid vendor ID."));
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      res.status(404);
      return next(new Error("Vendor not found."));
    }

    await Vendor.deleteOne({
      _id: vendor._id,
    });

    return res.status(200).json({
      success: true,
      message: "Vendor deleted successfully.",
      deletedVendorId: vendor._id,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
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
};
