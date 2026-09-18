import api from "./api";

export const generateAITasks = async (eventId) => {
  const response = await api.post(
    `/ai-tasks/${eventId}/generate`,
    {},
    {
      // Match AI plan generation: server-side retries and fallback can take
      // longer than ordinary API calls.
      timeout: 120000,
    },
  );

  return response.data;
};
