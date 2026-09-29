const mongoose = require("mongoose");

const Event = require("../models/Event");
const EventBudget = require("../models/EventBudget");
const EventTask = require("../models/EventTask");
const EventPlan = require("../models/EventPlan");

const { getMatchedVendors } = require("../services/vendorMatchingService");

const { getAssistantReply } = require("../services/aiAssistantService");

/**
 * POST /api/ai-assistant/:eventId/chat
 *
 * Uses the authenticated user's EventWise data as context
 * for the AI Assistant.
 */
const chatWithAssistant = async (req, res) => {
  const { eventId } = req.params;
  const { message } = req.body || {};

  // ----------------------------------------------------------
  // Validate event ID
  // ----------------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid event ID.",
    });
  }

  // ----------------------------------------------------------
  // Validate message
  // ----------------------------------------------------------

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Message is required and must be a non-empty string.",
    });
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Message is too long. Please keep it under 2000 characters.",
    });
  }

  // ----------------------------------------------------------
  // Fetch event
  //
  // IMPORTANT:
  // Always restrict the event to the authenticated user.
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
  // Fetch EventWise context
  // ----------------------------------------------------------

  const [budget, tasks, plan, vendors] = await Promise.all([
    EventBudget.findOne({
      event: event._id,
      user: req.user._id,
    }).lean(),

    EventTask.find({
      event: event._id,
      user: req.user._id,
    })
      .sort({
        dueDate: 1,
        createdAt: 1,
      })
      .limit(50)
      .lean(),

    EventPlan.findOne({
      event: event._id,
      user: req.user._id,
    }).lean(),

    getMatchedVendors(event, {
      limit: 10,
    }),
  ]);

  // ----------------------------------------------------------
  // Planning status
  // ----------------------------------------------------------

  const planningStatus = {
    budgetAvailable: Boolean(budget),

    taskCount: Array.isArray(tasks) ? tasks.length : 0,

    completedTaskCount: Array.isArray(tasks)
      ? tasks.filter(
          (task) => task.status === "Completed" || task.completed === true,
        ).length
      : 0,

    aiPlanAvailable: Boolean(plan),

    vendorCount: Array.isArray(vendors) ? vendors.length : 0,
  };

  console.log(
    `[AI Assistant] User ${req.user._id} asking about event "${event.title}" (${eventId})`,
  );

  // ----------------------------------------------------------
  // Ask AI Assistant
  // ----------------------------------------------------------

  const reply = await getAssistantReply(
    {
      event,
      budget,
      tasks,
      plan,
      vendors,
      planningStatus,
    },
    trimmedMessage,
  );

  // ----------------------------------------------------------
  // IMPORTANT RESPONSE CONTRACT
  //
  // message is ALWAYS a string.
  // ----------------------------------------------------------

  return res.status(200).json({
    success: true,

    message:
      typeof reply === "string"
        ? reply
        : reply?.message || "Unable to generate a response.",

    source: typeof reply === "string" ? "gemini" : reply?.source || "gemini",

    aiUnavailable:
      typeof reply === "string" ? false : Boolean(reply?.aiUnavailable),
  });
};

module.exports = {
  chatWithAssistant,
};
