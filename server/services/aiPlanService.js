import api from "./api";

export const generateAIPlan = async (eventId) => {
  const response = await api.post(
    `/ai-plans/${eventId}/generate`,
    {},
    {
      timeout: 120000,
    },
  );

  return response.data;
};

export const fetchAIPlan = async (eventId) => {
  const response = await api.get(`/ai-plans/${eventId}`, {
    timeout: 15000,
  });

  return response.data;
};
