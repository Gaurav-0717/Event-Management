require("dotenv").config();

const mongoose = require("mongoose");
const Vendor = require("./models/Vendor");

const vendors = [
  // ==========================================================
  // VENUE
  // ==========================================================

  {
    name: "Demo Modern Party Venue",
    description:
      "Demo modern event venue suitable for birthdays, parties and college events.",
    category: "Venue",
    city: "Pune",
    area: "Baner",
    address: "Demo Address, Baner, Pune",
    eventTypes: ["Birthday", "Party", "College Event"],
    minGuests: 20,
    maxGuests: 200,
    minBudget: 20000,
    maxBudget: 100000,
    currency: "INR",
    services: ["Event Hall", "Seating", "Basic Lighting", "Parking"],
    styles: ["Modern", "Theme-Based"],
    rating: 4.5,
    reviewCount: 25,
    available: true,
    isActive: true,
  },

  {
    name: "Demo Premium Celebration Hall",
    description:
      "Demo premium venue for larger celebrations and formal events.",
    category: "Venue",
    city: "Pune",
    area: "Kothrud",
    address: "Demo Address, Kothrud, Pune",
    eventTypes: ["Wedding", "Birthday", "Party", "Corporate"],
    minGuests: 50,
    maxGuests: 500,
    minBudget: 50000,
    maxBudget: 250000,
    currency: "INR",
    services: [
      "Large Hall",
      "Stage",
      "Lighting",
      "Parking",
      "Air Conditioning",
    ],
    styles: ["Luxury", "Modern"],
    rating: 4.7,
    reviewCount: 42,
    available: true,
    isActive: true,
  },

  // ==========================================================
  // FOOD
  // ==========================================================

  {
    name: "Demo Vegetarian Catering",
    description:
      "Demo vegetarian catering service for birthday and social events.",
    category: "Food",
    city: "Pune",
    area: "Shivajinagar",
    address: "Demo Address, Shivajinagar, Pune",
    eventTypes: ["Birthday", "Party", "College Event", "Wedding"],
    minGuests: 20,
    maxGuests: 500,
    minBudget: 15000,
    maxBudget: 150000,
    currency: "INR",
    services: ["Vegetarian Menu", "Buffet", "Beverages", "Desserts"],
    foodTypes: ["Vegetarian"],
    styles: ["Traditional", "Modern"],
    rating: 4.4,
    reviewCount: 31,
    available: true,
    isActive: true,
  },

  {
    name: "Demo Mixed Catering Service",
    description:
      "Demo catering service offering mixed menus for different event types.",
    category: "Food",
    city: "Pune",
    area: "Wakad",
    address: "Demo Address, Wakad, Pune",
    eventTypes: ["Birthday", "Party", "Corporate", "Wedding"],
    minGuests: 30,
    maxGuests: 1000,
    minBudget: 20000,
    maxBudget: 300000,
    currency: "INR",
    services: [
      "Buffet",
      "Vegetarian Menu",
      "Non-Vegetarian Menu",
      "Beverages",
      "Desserts",
    ],
    foodTypes: ["Vegetarian", "Non-Vegetarian", "Mixed"],
    styles: ["Modern", "Luxury"],
    rating: 4.6,
    reviewCount: 38,
    available: true,
    isActive: true,
  },

  // ==========================================================
  // DECORATION
  // ==========================================================

  {
    name: "Demo Theme Decoration",
    description:
      "Demo decoration service specializing in modern and theme-based celebrations.",
    category: "Decoration",
    city: "Pune",
    area: "Aundh",
    address: "Demo Address, Aundh, Pune",
    eventTypes: ["Birthday", "Party", "Wedding", "College Event"],
    minGuests: 10,
    maxGuests: 500,
    minBudget: 10000,
    maxBudget: 100000,
    currency: "INR",
    services: [
      "Theme Decoration",
      "Balloon Decoration",
      "Stage Decoration",
      "Lighting",
    ],
    styles: ["Modern", "Theme-Based", "Luxury"],
    rating: 4.5,
    reviewCount: 29,
    available: true,
    isActive: true,
  },

  // ==========================================================
  // ENTERTAINMENT
  // ==========================================================

  {
    name: "Demo DJ Entertainment",
    description:
      "Demo DJ and sound service for parties, birthdays and celebrations.",
    category: "Entertainment",
    city: "Pune",
    area: "Viman Nagar",
    address: "Demo Address, Viman Nagar, Pune",
    eventTypes: ["Birthday", "Party", "Wedding", "College Event"],
    minGuests: 20,
    maxGuests: 1000,
    minBudget: 8000,
    maxBudget: 80000,
    currency: "INR",
    services: ["DJ", "Sound System", "Party Lighting", "Music"],
    entertainmentTypes: ["DJ"],
    styles: ["Modern", "Theme-Based", "Casual"],
    rating: 4.3,
    reviewCount: 21,
    available: true,
    isActive: true,
  },

  // ==========================================================
  // PHOTOGRAPHY
  // ==========================================================

  {
    name: "Demo Event Photography",
    description:
      "Demo photography service for birthdays, parties and social events.",
    category: "Photography",
    city: "Pune",
    area: "Hadapsar",
    address: "Demo Address, Hadapsar, Pune",
    eventTypes: ["Birthday", "Party", "Wedding", "College Event"],
    minGuests: 10,
    maxGuests: 1000,
    minBudget: 10000,
    maxBudget: 120000,
    currency: "INR",
    services: ["Event Photography", "Candid Photography", "Video Recording"],
    styles: ["Modern", "Casual", "Luxury"],
    rating: 4.6,
    reviewCount: 34,
    available: true,
    isActive: true,
  },

  // ==========================================================
  // TRANSPORTATION
  // ==========================================================

  {
    name: "Demo Event Transportation",
    description: "Demo transportation service for event guests and organizers.",
    category: "Transportation",
    city: "Pune",
    area: "Camp",
    address: "Demo Address, Camp, Pune",
    eventTypes: ["Wedding", "Birthday", "Corporate", "Party"],
    minGuests: 5,
    maxGuests: 200,
    minBudget: 5000,
    maxBudget: 60000,
    currency: "INR",
    services: ["Guest Transportation", "Event Shuttle", "Pickup and Drop"],
    styles: ["Modern", "Luxury"],
    rating: 4.2,
    reviewCount: 17,
    available: true,
    isActive: true,
  },

  // ==========================================================
  // CORPORATE / OTHER
  // ==========================================================

  {
    name: "Demo Corporate Event Support",
    description:
      "Demo event support service for conferences and corporate events.",
    category: "Other",
    city: "Pune",
    area: "Hinjewadi",
    address: "Demo Address, Hinjewadi, Pune",
    eventTypes: ["Corporate", "Conference", "Workshop"],
    minGuests: 20,
    maxGuests: 1000,
    minBudget: 25000,
    maxBudget: 250000,
    currency: "INR",
    services: [
      "Event Coordination",
      "Registration",
      "Event Support",
      "Basic Equipment",
    ],
    styles: ["Modern", "Minimal"],
    rating: 4.4,
    reviewCount: 19,
    available: true,
    isActive: true,
  },
];

// ============================================================
// SEED DATABASE
// ============================================================

const seedVendors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    // Remove only demo vendors created by this seed script.
    await Vendor.deleteMany({
      name: /^Demo /,
    });

    console.log("Old demo vendors removed.");

    const insertedVendors = await Vendor.insertMany(vendors);

    console.log(
      `${insertedVendors.length} demo vendors inserted successfully.`,
    );

    insertedVendors.forEach((vendor) => {
      console.log(`- ${vendor.name} | ${vendor.category} | ${vendor.city}`);
    });

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");

    process.exit(0);
  } catch (error) {
    console.error("Vendor seed failed:", error);

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors.
    }

    process.exit(1);
  }
};

seedVendors();
