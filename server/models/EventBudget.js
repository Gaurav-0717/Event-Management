const mongoose = require("mongoose");

const budgetCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    allocatedAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  },
);

const eventBudgetSchema = new mongoose.Schema(
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

    totalBudget: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"],
      default: "INR",
    },

    categories: {
      type: [budgetCategorySchema],
      default: [],
    },

    totalAllocated: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingBudget: {
      type: Number,
      default: 0,
    },

    optimizationStrategy: {
      type: String,
      enum: [
        "Budget Focused",
        "Guest Experience",
        "Food Priority",
        "Decoration Priority",
        "Entertainment Priority",
        "Balanced",
      ],
      default: "Balanced",
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

module.exports = mongoose.model("EventBudget", eventBudgetSchema);
