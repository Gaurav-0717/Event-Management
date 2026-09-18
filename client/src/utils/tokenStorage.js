/**
 * Isolated JWT token storage layer.
 *
 * For this college project we use localStorage, but ALL token handling is
 * contained here so it can be swapped for a different strategy (e.g.
 * httpOnly cookies) without touching the rest of the app.
 *
 * Rules upheld:
 *  - Passwords are never stored.
 *  - Tokens are never placed in URLs.
 *  - Authentication secrets are never exposed via frontend env variables.
 */

const TOKEN_KEY = "eventwise_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable (private mode) — fail silently
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};
