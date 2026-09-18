const jwt = require("jsonwebtoken");

/**
 * Read the JWT secret from the environment.
 * Never hardcode secrets — fail fast if the variable is missing.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured. Add it to server/.env");
  }
  return secret;
};

const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "1d";

/**
 * Sign a JWT for a given user id.
 * Only the id is embedded — role and other claims are always
 * re-fetched from the database on each request (never trusted from the client).
 */
const generateToken = (userId) => {
  return jwt.sign({ id: String(userId) }, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
};

/**
 * Verify a JWT and return its decoded payload.
 * Throws JsonWebTokenError / TokenExpiredError on invalid or expired tokens.
 */
const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

/**
 * Extract a bearer token from an Authorization header.
 * Supports: `Authorization: Bearer <token>`
 */
const extractBearerToken = (authHeader) => {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return null;
  }
  return parts[1] || null;
};

module.exports = {
  generateToken,
  verifyToken,
  extractBearerToken,
  getJwtExpiresIn,
};
