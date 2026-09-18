const Event = require("../models/Event");
const EventPlan = require("../models/EventPlan");
const { generateEventPlan } = require("../services/aiPlannerService");

/**
 * Generate an AI event plan
 * POST /api/ai-plans/:eventId/generate
 */
const generatePlan = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Make sure the event belongs to the logged-in user
    const event = await Event.findOne({
      _id: eventId,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    console.log("[AI Plan] Generating plan for:", event.title);

    // Generate plan using Gemini
    const plan = await generateEventPlan(event);

    if (!plan) {
      return res.status(502).json({
        success: false,
        message: "AI failed to generate an event plan.",
      });
    }

    /*
     * Save/update the AI plan.
     *
     * Using findOneAndUpdate allows the user to regenerate
     * the plan without creating duplicate EventPlan documents.
     */
    const savedPlan = await EventPlan.findOneAndUpdate(
      {
        event: event._id,
        user: req.user._id,
      },
      {
        event: event._id,
        user: req.user._id,
        title: plan.title,
        summary: plan.summary,
        objectives: plan.objectives || [],
        itinerary: plan.itinerary || [],
        recommendations: plan.recommendations || [],
        notes: plan.notes || [],
        model: plan.model,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log("[AI Plan] Plan generated successfully.");

    return res.status(200).json({
      success: true,
      message: "AI event plan generated successfully.",
      plan: savedPlan,
    });
  } catch (error) {
    console.error("=============================================");
    console.error("[AI PLAN ERROR]");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Status Code:", error.statusCode);
    console.error("Name:", error.name);
    console.error("Full Error:", error);
    console.error("=============================================");

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to generate AI event plan.",
    });
  }
};

/**
 * Get the existing AI event plan
 * GET /api/ai-plans/:eventId
 */
const getPlan = async (req, res) => {
  const { eventId } = req.params;

  try {
    // First verify event ownership
    const event = await Event.findOne({
      _id: eventId,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const plan = await EventPlan.findOne({
      event: event._id,
      user: req.user._id,
    }).sort({ updatedAt: -1 });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No AI plan has been generated for this event yet.",
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("[AI PLAN GET ERROR]", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch AI event plan.",
    });
  }
};

module.exports = {
  generatePlan,
  getPlan,
};