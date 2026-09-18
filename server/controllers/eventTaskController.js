const { Event, EventTask } = require("../models");

// @desc    Get all tasks for an event
// @route   GET /api/events/:eventId/tasks
// @access  Private
const getEventTasks = async (req, res) => {
  const { eventId } = req.params;

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

  const tasks = await EventTask.find({
    event: eventId,
    user: req.user._id,
  }).sort({
    dueDate: 1,
    order: 1,
    createdAt: 1,
  });

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
};

// @desc    Create a new event task
// @route   POST /api/events/:eventId/tasks
// @access  Private
const createEventTask = async (req, res) => {
  const { eventId } = req.params;

  const { title, description, dueDate, priority, category, status, order } =
    req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Task title is required.",
    });
  }

  if (!dueDate) {
    return res.status(400).json({
      success: false,
      message: "Task due date is required.",
    });
  }

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

  const task = await EventTask.create({
    event: eventId,
    user: req.user._id,
    title: title.trim(),
    description: description?.trim() || "",
    dueDate,
    priority: priority || "Medium",
    category: category || "Other",
    status: status || "Pending",
    order: Number.isFinite(order) ? order : 0,
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully.",
    task,
  });
};

// @desc    Update an event task
// @route   PUT /api/events/:eventId/tasks/:taskId
// @access  Private
const updateEventTask = async (req, res) => {
  const { eventId, taskId } = req.params;

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

  const task = await EventTask.findOne({
    _id: taskId,
    event: eventId,
    user: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  const { title, description, dueDate, priority, category, status, order } =
    req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title cannot be empty.",
      });
    }

    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  if (dueDate !== undefined) {
    task.dueDate = dueDate;
  }

  if (priority !== undefined) {
    task.priority = priority;
  }

  if (category !== undefined) {
    task.category = category;
  }

  if (status !== undefined) {
    task.status = status;

    if (status === "Completed") {
      task.completedAt = task.completedAt || new Date();
    } else {
      task.completedAt = null;
    }
  }

  if (order !== undefined) {
    task.order = order;
  }

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task updated successfully.",
    task,
  });
};

// @desc    Mark task as completed
// @route   PATCH /api/events/:eventId/tasks/:taskId/complete
// @access  Private
const completeEventTask = async (req, res) => {
  const { eventId, taskId } = req.params;

  const task = await EventTask.findOne({
    _id: taskId,
    event: eventId,
    user: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  task.status = "Completed";
  task.completedAt = new Date();

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task marked as completed.",
    task,
  });
};

// @desc    Delete an event task
// @route   DELETE /api/events/:eventId/tasks/:taskId
// @access  Private
const deleteEventTask = async (req, res) => {
  const { eventId, taskId } = req.params;

  const task = await EventTask.findOne({
    _id: taskId,
    event: eventId,
    user: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: "Task deleted successfully.",
  });
};

module.exports = {
  getEventTasks,
  createEventTask,
  updateEventTask,
  completeEventTask,
  deleteEventTask,
};
