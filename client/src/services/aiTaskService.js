import api from "./api";

export const generateAITasks = async (eventId) => {
  const response = await api.post(
    `/ai-tasks/${eventId}/generate`,
    {},
    {
      timeout: 60000,
    },
  );

  return response.data;
};
