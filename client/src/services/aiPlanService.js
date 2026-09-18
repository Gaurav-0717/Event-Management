import api from "./api";

// ============================================================
// AI PLAN GENERATION
// Gemini generation can take longer than normal API requests.
// Allow up to 120 seconds.
// ============================================================

export const generateAIPlan = async (eventId) => {
  try {
    const response = await api.post(
      `/ai-plans/${eventId}/generate`,
      {},
      {
        timeout: 120000,
      },
    );

    return response.data;
  } catch (error) {
    console.error("AI plan generation request failed:", error);

    throw error;
  }
};

// ============================================================
// FETCH EXISTING AI PLAN
// Normal API request, so 15 seconds is enough.
// ============================================================

export const fetchAIPlan = async (eventId) => {
  try {
    const response = await api.get(`/ai-plans/${eventId}`, {
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
