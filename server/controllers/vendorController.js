const mongoose = require("mongoose");
const Vendor = require("../models/Vendor");

// ============================================================
// GET ALL VENDORS
// ============================================================

const getVendors = async (req, res) => {
  try {
    const {
      category,
      city,
      eventType,
      minGuests,
      maxGuests,
      minBudget,
      maxBudget,
      search,
      available,
    } = req.query;

    const filter = {
      isActive: true,
    };

    // ----------------------------------------------------------
    // CATEGORY FILTER
    // ----------------------------------------------------------

    if (category) {
      filter.category = category;
    }

    // ----------------------------------------------------------
    // CITY FILTER
    // ----------------------------------------------------------

    if (city) {
      filter.city = {
        $regex: city.trim(),
        $options: "i",
      };
    }

    // ----------------------------------------------------------
    // EVENT TYPE FILTER
    // ----------------------------------------------------------

    if (eventType) {
      filter.eventTypes = eventType;
    }

    // ----------------------------------------------------------
    // GUEST CAPACITY FILTER
    // ----------------------------------------------------------

    if (minGuests) {
      const guests = Number(minGuests);

      if (!Number.isNaN(guests)) {
        filter.maxGuests = {
          $gte: guests,
        };
      }
    }

    if (maxGuests) {
      const guests = Number(maxGuests);

      if (!Number.isNaN(guests)) {
        filter.minGuests = {
          $lte: guests,
        };
      }
    }

    // ----------------------------------------------------------
    // BUDGET FILTER
    // ----------------------------------------------------------

    if (minBudget) {
      const budget = Number(minBudget);

      if (!Number.isNaN(budget)) {
        filter.maxBudget = {
          $gte: budget,
        };
      }
    }

    if (maxBudget) {
      const budget = Number(maxBudget);

      if (!Number.isNaN(budget)) {
        filter.minBudget = {
          $lte: budget,
        };
      }
    }

    // ----------------------------------------------------------
    // AVAILABILITY FILTER
    // ----------------------------------------------------------

    if (available !== undefined) {
      filter.available = available === "true";
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search) {
      const searchRegex = {
        $regex: search.trim(),
        $options: "i",
      };

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { area: searchRegex },
        { category: searchRegex },
        { services: searchRegex },
      ];
    }

    // ----------------------------------------------------------
    // FETCH VENDORS
    // ----------------------------------------------------------

    const vendors = await Vendor.find(filter)
      .sort({
        rating: -1,
        reviewCount: -1,
        name: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("[Vendor] Get vendors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendors.",
    });
  }
};

// ============================================================
// GET SINGLE VENDOR
// ============================================================

const getVendorById = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
    }

    const vendor = await Vendor.findOne({
      _id: vendorId,
      isActive: true,
    }).lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      vendor,
    });
  } catch (error) {
    console.error("[Vendor] Get vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor.",
    });
  }
};

// ============================================================
// CREATE VENDOR
// ============================================================

const createVendor = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      city,
      area,
      address,
      eventTypes,
      minGuests,
      maxGuests,
      minBudget,
      maxBudget,
      currency,
      services,
      styles,
      foodTypes,
      entertainmentTypes,
      phone,
      email,
      website,
      rating,
      reviewCount,
      available,
    } = req.body;

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (!name || !category || !city) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and city are required.",
      });
    }

    // ----------------------------------------------------------
    // CREATE VENDOR
    // ----------------------------------------------------------

    const vendor = await Vendor.create({
      name,
      description,
      category,
      city,
      area,
      address,
      eventTypes,
      minGuests,
      maxGuests,
      minBudget,
      maxBudget,
      currency,
      services,
      styles,
      foodTypes,
      entertainmentTypes,
      phone,
      email,
      website,
      rating,
      reviewCount,
      available,
    });

    console.log(`[Vendor] Created vendor: ${vendor.name}`);

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully.",
      vendor,
    });
  } catch (error) {
    console.error("[Vendor] Create vendor error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create vendor.",
    });
  }
};

// ============================================================
// UPDATE VENDOR
// ============================================================

const updateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
    }

    // ----------------------------------------------------------
    // ALLOWED FIELDS
    // ----------------------------------------------------------

    const allowedFields = [
      "name",
      "description",
      "category",
      "city",
      "area",
      "address",
      "eventTypes",
      "minGuests",
      "maxGuests",
      "minBudget",
      "maxBudget",
      "currency",
      "services",
      "styles",
      "foodTypes",
      "entertainmentTypes",
      "phone",
      "email",
      "website",
      "rating",
      "reviewCount",
      "available",
      "isActive",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    const vendor = await Vendor.findByIdAndUpdate(vendorId, updates, {
      new: true,
      runValidators: true,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    console.log(`[Vendor] Updated vendor: ${vendor.name}`);

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully.",
      vendor,
    });
  } catch (error) {
    console.error("[Vendor] Update vendor error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update vendor.",
    });
  }
};

// ============================================================
// DELETE VENDOR
// ============================================================

const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
    }

    // ----------------------------------------------------------
    // SOFT DELETE
    // ----------------------------------------------------------

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        isActive: false,
        available: false,
      },
      {
        new: true,
      },
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    console.log(`[Vendor] Deactivated vendor: ${vendor.name}`);

    return res.status(200).json({
      success: true,
      message: "Vendor removed successfully.",
    });
  } catch (error) {
    console.error("[Vendor] Delete vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove vendor.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};
