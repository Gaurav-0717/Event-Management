import api from "./api";

// Generate or regenerate an optimized budget
export const generateBudget = async (eventId) => {
  const response = await api.post(
    `/budgets/${eventId}/generate`,
    {},
    {
      timeout: 15000,
    },
  );

  return response.data;
};

// Fetch the existing optimized budget
export const fetchBudget = async (eventId) => {
  const response = await api.get(`/budgets/${eventId}`, {
    timeout: 10000,
  });

  return response.data;
};

// Update editable budget allocation
export const updateBudget = async (eventId, categories) => {
  const response = await api.put(
    `/budgets/${eventId}`,
    {
      categories,
    },
    {
      timeout: 10000,
    },
  );

  return response.data;
};
