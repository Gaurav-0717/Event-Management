const mongoose = require("mongoose");

// ============================================================
// VENDOR SCHEMA
// ============================================================

const vendorSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // BASIC INFORMATION
    // ----------------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // ----------------------------------------------------------
    // VENDOR CATEGORY
    // ----------------------------------------------------------

    category: {
      type: String,
      required: true,
      enum: [
        "Venue",
        "Food",
        "Decoration",
        "Entertainment",
        "Photography",
        "Transportation",
        "Other",
      ],
      index: true,
    },

    // ----------------------------------------------------------
    // LOCATION
    // ----------------------------------------------------------

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    area: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    // ----------------------------------------------------------
    // EVENT TYPES
    // ----------------------------------------------------------

    eventTypes: [
      {
        type: String,
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
    ],

    // ----------------------------------------------------------
    // CAPACITY
    // ----------------------------------------------------------

    minGuests: {
      type: Number,
      default: 1,
      min: 1,
    },

    maxGuests: {
      type: Number,
      default: 100000,
      min: 1,
    },

    // ----------------------------------------------------------
    // BUDGET
    // ----------------------------------------------------------

    minBudget: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxBudget: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"],
      default: "INR",
    },

    // ----------------------------------------------------------
    // SERVICES
    // ----------------------------------------------------------

    services: [
      {
        type: String,
        trim: true,
        maxlength: 150,
      },
    ],

    // ----------------------------------------------------------
    // STYLE / PREFERENCES
    // ----------------------------------------------------------

    styles: [
      {
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
      },
    ],

    foodTypes: [
      {
        type: String,
        enum: [
          "Vegetarian",
          "Non-Vegetarian",
          "Vegan",
          "Mixed",
          "No Preference",
        ],
      },
    ],

    entertainmentTypes: [
      {
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
      },
    ],

    // ----------------------------------------------------------
    // CONTACT INFORMATION
    // ----------------------------------------------------------

    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    website: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    // ----------------------------------------------------------
    // RATING
    // ----------------------------------------------------------

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ----------------------------------------------------------
    // AVAILABILITY
    // ----------------------------------------------------------

    available: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ----------------------------------------------------------
    // ACTIVE STATUS
    // ----------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// INDEXES
// ============================================================

vendorSchema.index({
  category: 1,
  city: 1,
  isActive: 1,
});

vendorSchema.index({
  eventTypes: 1,
  city: 1,
});

vendorSchema.index({
  minGuests: 1,
  maxGuests: 1,
});

vendorSchema.index({
  minBudget: 1,
  maxBudget: 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports = mongoose.model("Vendor", vendorSchema);
