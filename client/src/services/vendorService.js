import api from "./api";

// ============================================================
// GET MATCHED VENDORS FOR AN EVENT
// ============================================================

export const fetchMatchedVendors = async (
  eventId,
  category = "",
  limit = 20,
) => {
  const params = {};

  if (category) {
    params.category = category;
  }

  if (limit) {
    params.limit = limit;
  }

  const response = await api.get(`/vendors/match/${eventId}`, {
    params,
    timeout: 15000,
  });

  return response.data;
};

// ============================================================
// GET ALL VENDORS
// ============================================================

export const fetchVendors = async (filters = {}) => {
  const response = await api.get("/vendors", {
    params: filters,
    timeout: 15000,
  });

  return response.data;
};

// ============================================================
// GET SINGLE VENDOR
// ============================================================

export const fetchVendorById = async (vendorId) => {
  const response = await api.get(`/vendors/${vendorId}`, {
    timeout: 15000,
  });

  return response.data;
};
