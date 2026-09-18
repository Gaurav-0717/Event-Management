const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Event title must be at least 3 characters"],
      maxlength: [120, "Event title cannot exceed 120 characters"],
    },

    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: [
        "Wedding",
        "Birthday",
        "Corporate",
        "Conference",
        "Workshop",
        "Party",
        "College Event",
        "Festival",
        "Other",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },

    guestCount: {
      type: Number,
      required: [true, "Guest count is required"],
      min: [1, "Guest count must be at least 1"],
      max: [100000, "Guest count cannot exceed 100000"],
    },

    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },

    status: {
      type: String,
      enum: ["draft", "planning", "confirmed", "completed", "cancelled"],
      default: "draft",
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP"],
    },

    planningPreferences: {
      style: {
        type: String,
        enum: [
          "Traditional",
          "Modern",
          "Minimal",
          "Luxury",
          "Casual",
          "Theme-Based",
          "Eco-Friendly",
        ],
        default: "Modern",
      },

      food: {
        type: String,
        enum: [
          "Vegetarian",
          "Non-Vegetarian",
          "Vegan",
          "Mixed",
          "No Preference",
        ],
        default: "No Preference",
      },

      decoration: {
        type: String,
        enum: [
          "Simple",
          "Elegant",
          "Traditional",
          "Theme-Based",
          "Luxury",
          "No Preference",
        ],
        default: "No Preference",
      },

      entertainment: {
        type: String,
        enum: [
          "DJ",
          "Live Music",
          "Games",
          "Dance",
          "Cultural Program",
          "Photography",
          "No Preference",
        ],
        default: "No Preference",
      },

      priority: {
        type: String,
        enum: [
          "Budget",
          "Guest Experience",
          "Food",
          "Decoration",
          "Entertainment",
          "Balanced",
        ],
        default: "Balanced",
      },

      specialRequirements: {
        type: String,
        maxlength: 1500,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Event", eventSchema);
