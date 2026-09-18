const Vendor = require("../models/Vendor");

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const includesIgnoreCase = (array, value) => {
  if (!Array.isArray(array) || !value) {
    return false;
  }

  const target = normalize(value);

  return array.some((item) => normalize(item) === target);
};

// ============================================================
// SCORE EVENT TYPE
// ============================================================

const calculateEventTypeScore = (event, vendor) => {
  if (!event?.eventType || !Array.isArray(vendor?.eventTypes)) {
    return 0;
  }

  return includesIgnoreCase(vendor.eventTypes, event.eventType) ? 20 : 0;
};

// ============================================================
// SCORE LOCATION
// ============================================================

const calculateLocationScore = (event, vendor) => {
  if (!event?.location || !vendor?.city) {
    return 0;
  }

  const eventLocation = normalize(event.location);
  const vendorCity = normalize(vendor.city);

  if (
    eventLocation.includes(vendorCity) ||
    vendorCity.includes(eventLocation)
  ) {
    return 20;
  }

  return 0;
};

// ============================================================
// SCORE GUEST CAPACITY
// ============================================================

const calculateGuestScore = (event, vendor) => {
  const guests = Number(event?.guestCount);

  if (!Number.isFinite(guests) || guests <= 0) {
    return 0;
  }

  const minGuests = Number(vendor?.minGuests || 0);

  const maxGuests = Number(vendor?.maxGuests || 0);

  if (guests >= minGuests && guests <= maxGuests) {
    return 20;
  }

  // Slight partial score if the vendor
  // can accommodate the guest count
  // with a small capacity mismatch.

  if (guests <= maxGuests && guests > minGuests) {
    return 15;
  }

  return 0;
};

// ============================================================
// SCORE BUDGET
// ============================================================

const calculateBudgetScore = (event, vendor) => {
  const eventBudget = Number(event?.budget);

  if (!Number.isFinite(eventBudget) || eventBudget <= 0) {
    return 0;
  }

  const vendorMin = Number(vendor?.minBudget || 0);

  const vendorMax = Number(vendor?.maxBudget || 0);

  // Vendor budget range overlaps
  // the event budget.

  if (eventBudget >= vendorMin && eventBudget <= vendorMax) {
    return 20;
  }

  // Event budget is below vendor minimum
  // but close enough to receive a partial score.

  if (eventBudget < vendorMin && vendorMin > 0) {
    const difference = (vendorMin - eventBudget) / eventBudget;

    if (difference <= 0.25) {
      return 10;
    }
  }

  // Event budget is above vendor maximum.
  // Still compatible, but not a perfect match.

  if (eventBudget > vendorMax && vendorMax > 0) {
    const difference = (eventBudget - vendorMax) / eventBudget;

    if (difference <= 0.25) {
      return 10;
    }
  }

  return 0;
};

// ============================================================
// SCORE STYLE
// ============================================================

const calculateStyleScore = (event, vendor) => {
  const style = event?.planningPreferences?.style;

  if (!style || !Array.isArray(vendor?.styles)) {
    return 0;
  }

  return includesIgnoreCase(vendor.styles, style) ? 10 : 0;
};

// ============================================================
// SCORE FOOD
// ============================================================

const calculateFoodScore = (event, vendor) => {
  const food = event?.planningPreferences?.food;

  if (!food || !Array.isArray(vendor?.foodTypes)) {
    return 0;
  }

  if (normalize(food) === "no preference") {
    return 5;
  }

  return includesIgnoreCase(vendor.foodTypes, food) ? 10 : 0;
};

// ============================================================
// SCORE ENTERTAINMENT
// ============================================================

const calculateEntertainmentScore = (event, vendor) => {
  const entertainment = event?.planningPreferences?.entertainment;

  if (!entertainment || !Array.isArray(vendor?.entertainmentTypes)) {
    return 0;
  }

  if (normalize(entertainment) === "no preference") {
    return 5;
  }

  return includesIgnoreCase(vendor.entertainmentTypes, entertainment) ? 10 : 0;
};

// ============================================================
// SCORE VENDOR
// ============================================================

const calculateVendorMatch = (event, vendor) => {
  const eventTypeScore = calculateEventTypeScore(event, vendor);

  const locationScore = calculateLocationScore(event, vendor);

  const guestScore = calculateGuestScore(event, vendor);

  const budgetScore = calculateBudgetScore(event, vendor);

  const styleScore = calculateStyleScore(event, vendor);

  const foodScore = calculateFoodScore(event, vendor);

  const entertainmentScore = calculateEntertainmentScore(event, vendor);

  const rawScore =
    eventTypeScore +
    locationScore +
    guestScore +
    budgetScore +
    styleScore +
    foodScore +
    entertainmentScore;

  // Maximum:
  //
  // Event type       20
  // Location         20
  // Guests           20
  // Budget           20
  // Style            10
  // Food             10
  // Entertainment    10
  //
  // Total = 110
  //
  // Convert to percentage.

  const matchPercentage = Math.round((rawScore / 110) * 100);

  return {
    score: rawScore,
    matchPercentage,

    breakdown: {
      eventType: eventTypeScore,
      location: locationScore,
      guests: guestScore,
      budget: budgetScore,
      style: styleScore,
      food: foodScore,
      entertainment: entertainmentScore,
    },
  };
};

// ============================================================
// GET MATCHED VENDORS
// ============================================================

const getMatchedVendors = async (event, options = {}) => {
  const { category, limit = 20 } = options;

  const filter = {
    isActive: true,
    available: true,
  };

  if (category) {
    filter.category = category;
  }

  const vendors = await Vendor.find(filter).lean();

  const matchedVendors = vendors
    .map((vendor) => {
      const match = calculateVendorMatch(event, vendor);

      return {
        ...vendor,

        matchPercentage: match.matchPercentage,

        matchScore: match.score,

        matchBreakdown: match.breakdown,
      };
    })
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }

      return Number(b.rating || 0) - Number(a.rating || 0);
    })
    .slice(0, Number(limit));

  return matchedVendors;
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  calculateVendorMatch,
  getMatchedVendors,
};
