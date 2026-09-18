import api from "./api";

// ================================
// ADMIN DASHBOARD
// ================================

export const fetchAdminStats = async () => {
  const response = await api.get("/admin/stats");

  return response.data;
};

// ================================
// USER MANAGEMENT
// ================================

export const fetchAdminUsers = async () => {
  const response = await api.get("/admin/users");

  return response.data;
};

export const updateAdminUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, {
    role,
  });

  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);

  return response.data;
};

// ================================
// EVENT MANAGEMENT
// ================================

export const fetchAdminEvents = async () => {
  const response = await api.get("/admin/events");

  return response.data;
};

// ================================
// VENDOR MANAGEMENT
// ================================

export const fetchAdminVendors = async () => {
  const response = await api.get("/admin/vendors");

  return response.data;
};

// ================================
// AI PLAN MONITORING
// ================================

export const fetchAdminAIPlans = async () => {
  const response = await api.get("/admin/ai-plans");

  return response.data;
};

export const deleteAdminEvent = async (eventId) => {
  const response = await api.delete(`/admin/events/${eventId}`);

  return response.data;
};

export const updateAdminVendor = async (vendorId, vendorData) => {
  const response = await api.put(`/admin/vendors/${vendorId}`, vendorData);

  return response.data;
};

export const deleteAdminVendor = async (vendorId) => {
  const response = await api.delete(`/admin/vendors/${vendorId}`);

  return response.data;
};
