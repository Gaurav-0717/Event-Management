const mongoose = require("mongoose");

const Event = require("../models/Event");
const { getMatchedVendors } = require("../services/vendorMatchingService");

// ============================================================
// GET MATCHED VENDORS FOR AN EVENT
// GET /api/vendors/match/:eventId
// ============================================================

const getMatchedVendorsForEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    // ----------------------------------------------------------
    // Validate Event ID
    // ----------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    // ----------------------------------------------------------
    // Find event belonging to logged-in user
    // ----------------------------------------------------------

    const event = await Event.findOne({
      _id: eventId,
      user: req.user._id,
    }).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // ----------------------------------------------------------
    // Read optional query parameters
    // ----------------------------------------------------------

    const { category, limit } = req.query;

    let parsedLimit = 20;

    if (limit !== undefined) {
      parsedLimit = Number(limit);

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 50
      ) {
        return res.status(400).json({
          success: false,
          message: "Limit must be an integer between 1 and 50.",
        });
      }
    }

    // ----------------------------------------------------------
    // Get matched vendors
    // ----------------------------------------------------------

    const vendors = await getMatchedVendors(event, {
      category: category?.trim() || undefined,
      limit: parsedLimit,
    });

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        eventType: event.eventType,
        eventDate: event.eventDate,
        location: event.location,
        guestCount: event.guestCount,
        budget: event.budget,
      },
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("=============================================");
    console.error("[VENDOR MATCHING ERROR]");
    console.error("Message:", error.message);
    console.error("Full Error:", error);
    console.error("=============================================");

    return res.status(500).json({
      success: false,
      message: "Failed to match vendors.",
    });
  }
};

module.exports = {
  getMatchedVendorsForEvent,
};
