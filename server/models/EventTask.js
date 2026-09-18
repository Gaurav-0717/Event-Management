const mongoose = require("mongoose");

const eventTaskSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    category: {
      type: String,
      enum: [
        "Venue",
        "Food",
        "Decoration",
        "Entertainment",
        "Photography",
        "Guests",
        "Transportation",
        "Budget",
        "Other",
      ],
      default: "Other",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },

    // Identifies whether the task was created manually or by AI.
    source: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("EventTask", eventTaskSchema);
