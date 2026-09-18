const Event = require("../models/Event");
const EventBudget = require("../models/EventBudget");

const roundAmount = (amount) => {
  return Math.round(amount);
};

const calculateBudget = (event) => {
  const preferences = event.planningPreferences || {};

  // Base allocation percentages
  let allocation = {
    Venue: 15,
    Food: 30,
    Decoration: 15,
    Entertainment: 15,
    Photography: 10,
    Transportation: 5,
    Miscellaneous: 10,
  };

  // Adjust according to food preference
  if (preferences.food === "Vegetarian") {
    allocation.Food += 2;
    allocation.Miscellaneous -= 2;
  }

  if (preferences.food === "Non-Vegetarian") {
    allocation.Food += 3;
    allocation.Miscellaneous -= 3;
  }

  if (preferences.food === "Vegan") {
    allocation.Food += 4;
    allocation.Miscellaneous -= 4;
  }

  // Adjust decoration
  if (preferences.decoration === "Luxury") {
    allocation.Decoration += 7;
    allocation.Miscellaneous -= 4;
    allocation.Entertainment -= 3;
  }

  if (preferences.decoration === "Elegant") {
    allocation.Decoration += 4;
    allocation.Miscellaneous -= 2;
    allocation.Entertainment -= 2;
  }

  if (preferences.decoration === "Theme-Based") {
    allocation.Decoration += 5;
    allocation.Miscellaneous -= 2;
    allocation.Entertainment -= 3;
  }

  if (preferences.decoration === "Simple") {
    allocation.Decoration -= 4;
    allocation.Miscellaneous += 2;
    allocation.Food += 2;
  }

  // Adjust entertainment
  if (preferences.entertainment === "DJ") {
    allocation.Entertainment += 5;
    allocation.Miscellaneous -= 2;
    allocation.Transportation -= 3;
  }

  if (preferences.entertainment === "Live Music") {
    allocation.Entertainment += 7;
    allocation.Miscellaneous -= 4;
    allocation.Transportation -= 3;
  }

  if (preferences.entertainment === "Dance") {
    allocation.Entertainment += 4;
    allocation.Miscellaneous -= 2;
    allocation.Transportation -= 2;
  }

  if (preferences.entertainment === "Games") {
    allocation.Entertainment += 2;
    allocation.Miscellaneous -= 2;
  }

  // Adjust according to main priority
  switch (preferences.priority) {
    case "Budget":
      allocation.Miscellaneous += 3;
      allocation.Decoration -= 2;
      allocation.Entertainment -= 1;
      break;

    case "Guest Experience":
      allocation.Food += 4;
      allocation.Entertainment += 3;
      allocation.Miscellaneous -= 2;
      allocation.Transportation -= 2;
      allocation.Photography -= 3;
      break;

    case "Food":
      allocation.Food += 7;
      allocation.Decoration -= 2;
      allocation.Entertainment -= 2;
      allocation.Miscellaneous -= 3;
      break;

    case "Decoration":
      allocation.Decoration += 7;
      allocation.Food -= 2;
      allocation.Entertainment -= 2;
      allocation.Miscellaneous -= 3;
      break;

    case "Entertainment":
      allocation.Entertainment += 7;
      allocation.Decoration -= 2;
      allocation.Food -= 2;
      allocation.Miscellaneous -= 3;
      break;

    case "Balanced":
    default:
      break;
  }

  // Adjust for event type
  if (event.eventType === "Wedding" || event.eventType === "Conference") {
    allocation.Venue += 5;
    allocation.Food += 3;
    allocation.Miscellaneous -= 3;
    allocation.Transportation -= 2;
    allocation.Photography -= 3;
  }

  if (event.eventType === "Birthday" || event.eventType === "Party") {
    allocation.Entertainment += 3;
    allocation.Decoration += 2;
    allocation.Venue -= 2;
    allocation.Miscellaneous -= 3;
  }

  if (event.eventType === "Corporate" || event.eventType === "Workshop") {
    allocation.Venue += 4;
    allocation.Transportation += 2;
    allocation.Entertainment -= 3;
    allocation.Decoration -= 1;
    allocation.Miscellaneous -= 2;
  }

  // Prevent negative percentages
  Object.keys(allocation).forEach((category) => {
    allocation[category] = Math.max(0, allocation[category]);
  });

  // Normalize percentages so total is exactly 100
  const totalPercentage = Object.values(allocation).reduce(
    (sum, value) => sum + value,
    0,
  );

  const normalizedAllocation = {};

  Object.entries(allocation).forEach(([category, percentage]) => {
    normalizedAllocation[category] = (percentage / totalPercentage) * 100;
  });

  const totalBudget = Number(event.budget);

  const categoryDescriptions = {
    Venue: "Venue, hall, seating, and basic event infrastructure.",
    Food: "Catering, meals, snacks, beverages, and service.",
    Decoration: "Decorations, theme setup, lighting, flowers, and styling.",
    Entertainment:
      "DJ, music, games, activities, performances, or entertainment equipment.",
    Photography: "Photography, videography, and event memories.",
    Transportation: "Local transportation, logistics, and guest movement.",
    Miscellaneous:
      "Contingency, unexpected expenses, and small event requirements.",
  };

  const categories = Object.entries(normalizedAllocation).map(
    ([category, percentage]) => {
      const roundedPercentage = Math.round(percentage * 100) / 100;

      return {
        category,
        percentage: roundedPercentage,
        allocatedAmount: roundAmount(totalBudget * (roundedPercentage / 100)),
        description: categoryDescriptions[category],
      };
    },
  );

  // Correct rounding difference so allocated amount equals budget
  const totalAllocated = categories.reduce(
    (sum, item) => sum + item.allocatedAmount,
    0,
  );

  const difference = totalBudget - totalAllocated;

  if (categories.length > 0 && difference !== 0) {
    const miscellaneous = categories.find(
      (item) => item.category === "Miscellaneous",
    );

    if (miscellaneous) {
      miscellaneous.allocatedAmount += difference;
    }
  }

  const finalTotalAllocated = categories.reduce(
    (sum, item) => sum + item.allocatedAmount,
    0,
  );

  const remainingBudget = totalBudget - finalTotalAllocated;

  return {
    categories,
    totalAllocated: finalTotalAllocated,
    remainingBudget,
  };
};

// Generate or regenerate optimized budget
const generateBudget = async (req, res) => {
  const { eventId } = req.params;

  try {
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

    if (event.budget < 0) {
      return res.status(400).json({
        success: false,
        message: "Event budget cannot be negative.",
      });
    }

    const budget = calculateBudget(event);

    const optimizationStrategy =
      event.planningPreferences?.priority || "Balanced";

    const savedBudget = await EventBudget.findOneAndUpdate(
      {
        event: event._id,
        user: req.user._id,
      },
      {
        event: event._id,
        user: req.user._id,
        totalBudget: event.budget,
        currency: event.currency,
        categories: budget.categories,
        totalAllocated: budget.totalAllocated,
        remainingBudget: budget.remainingBudget,
        optimizationStrategy,
        generatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Event budget optimized successfully.",
      budget: savedBudget,
    });
  } catch (error) {
    console.error("[Budget Optimizer] Generate error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate optimized budget.",
    });
  }
};

// Get existing budget
const getBudget = async (req, res) => {
  const { eventId } = req.params;

  try {
    const budget = await EventBudget.findOne({
      event: eventId,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "No optimized budget has been generated for this event yet.",
      });
    }

    return res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    console.error("[Budget Optimizer] Get error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch event budget.",
    });
  }
};

/*
 * Update editable budget allocation
 *
 * Client sends:
 * {
 *   categories: [
 *     {
 *       category: "Venue",
 *       allocatedAmount: 50000
 *     },
 *     ...
 *   ]
 * }
 *
 * Percentage is calculated on the server.
 */
const updateBudget = async (req, res) => {
  const { eventId } = req.params;
  const { categories } = req.body;

  try {
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Categories must be a non-empty array.",
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

    const budget = await EventBudget.findOne({
      event: eventId,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "No optimized budget has been generated for this event yet.",
      });
    }

    const totalBudget = Number(event.budget);

    if (!Number.isFinite(totalBudget) || totalBudget < 0) {
      return res.status(400).json({
        success: false,
        message: "Event budget is invalid.",
      });
    }

    // Prevent unknown categories from being added.
    const existingCategories = new Set(
      budget.categories.map((item) => item.category),
    );

    const submittedCategories = new Set();

    const updatedCategories = categories.map((item) => {
      const category = String(item.category || "").trim();

      if (!category) {
        throw new Error("Every budget category must have a name.");
      }

      if (!existingCategories.has(category)) {
        throw new Error(`Invalid budget category: ${category}`);
      }

      if (submittedCategories.has(category)) {
        throw new Error(`Duplicate budget category: ${category}`);
      }

      submittedCategories.add(category);

      const amount = Number(item.allocatedAmount);

      if (!Number.isFinite(amount) || amount < 0) {
        throw new Error(`Invalid allocated amount for ${category}.`);
      }

      const roundedAmount = roundAmount(amount);

      const percentage =
        totalBudget > 0
          ? Math.round((roundedAmount / totalBudget) * 10000) / 100
          : 0;

      const originalCategory = budget.categories.find(
        (existing) => existing.category === category,
      );

      return {
        category,
        percentage,
        allocatedAmount: roundedAmount,
        description: originalCategory?.description || "",
      };
    });

    // Make sure no existing category was accidentally removed.
    if (submittedCategories.size !== budget.categories.length) {
      return res.status(400).json({
        success: false,
        message: "All existing budget categories must be included.",
      });
    }

    const totalAllocated = updatedCategories.reduce(
      (sum, item) => sum + item.allocatedAmount,
      0,
    );

    // Never allow allocation above the total event budget.
    if (totalAllocated > totalBudget) {
      return res.status(400).json({
        success: false,
        message: `Total allocation cannot exceed the event budget of ${totalBudget}.`,
        totalBudget,
        totalAllocated,
        remainingBudget: totalBudget - totalAllocated,
      });
    }

    const remainingBudget = totalBudget - totalAllocated;

    budget.categories = updatedCategories;
    budget.totalBudget = totalBudget;
    budget.totalAllocated = totalAllocated;
    budget.remainingBudget = remainingBudget;
    budget.currency = event.currency;

    const updatedBudget = await budget.save();

    return res.status(200).json({
      success: true,
      message: "Budget allocation updated successfully.",
      budget: updatedBudget,
    });
  } catch (error) {
    console.error("[Budget Optimizer] Update error:", error);

    if (
      error.message?.startsWith("Invalid budget category") ||
      error.message?.startsWith("Duplicate budget category") ||
      error.message?.startsWith("Invalid allocated amount") ||
      error.message?.startsWith("Every budget category") ||
      error.message?.startsWith("All existing budget categories")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update budget allocation.",
    });
  }
};

module.exports = {
  generateBudget,
  getBudget,
  updateBudget,
};
