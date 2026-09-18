const mongoose = require("mongoose");

const itineraryItemSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      trim: true,
    },

    activity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      max: 1440,
    },
  },
  { _id: false },
);

const recommendationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },

    recommendation: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const eventPlanSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true,
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
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    objectives: {
      type: [String],
      default: [],
    },

    itinerary: {
      type: [itineraryItemSchema],
      default: [],
    },

    recommendations: {
      type: [recommendationSchema],
      default: [],
    },

    notes: {
      type: [String],
      default: [],
    },

    model: {
      type: String,
      required: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("EventPlan", eventPlanSchema);
