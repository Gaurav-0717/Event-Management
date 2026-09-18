import api from "./api";

/**
 * Authentication API service.
 * Reuses the single shared Axios instance from `./api` — no duplicate clients.
 */
export const registerUser = async ({ name, email, password }) => {
  const response = await api.post("/auth/register", { name, email, password });
  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
