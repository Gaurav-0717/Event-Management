import api from "./api";

export const sendAssistantMessage = async (eventId, message) => {
  const response = await api.post(
    `/ai-assistant/${eventId}/chat`,
    { message },
    {
      timeout: 30000,
    },
  );

  return response.data;
};
