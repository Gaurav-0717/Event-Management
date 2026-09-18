const Event = require("../models/Event");
const EventPlan = require("../models/EventPlan");
const EventBudget = require("../models/EventBudget");
const EventTask = require("../models/EventTask");

const getUserEvents = async (req, res) => {
  const events = await Event.find({
    user: req.user._id,
  }).sort({ eventDate: 1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: events.length,
    events,
  });
};

const getEventById = async (req, res, next) => {
  const event = await Event.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!event) {
    res.status(404);
    return next(new Error("Event not found"));
  }

  return res.status(200).json({
    success: true,
    event,
  });
};

const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      eventType,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      guestCount,
      budget,
      status,
      currency,
      planningPreferences,
    } = req.body;

    const event = await Event.create({
      user: req.user._id,
      title,
      eventType,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      guestCount,
      budget,
      status,
      currency,
      planningPreferences,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    return next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const allowedFields = [
      "title",
      "eventType",
      "description",
      "eventDate",
      "startTime",
      "endTime",
      "location",
      "guestCount",
      "budget",
      "status",
      "currency",
      "planningPreferences",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    // Keep event-owned planning records from becoming orphaned. The same
    // cleanup is performed by the admin deletion paths.
    await Promise.all([
      EventPlan.deleteMany({ event: event._id }),
      EventBudget.deleteMany({ event: event._id }),
      EventTask.deleteMany({ event: event._id }),
    ]);

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUserEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
