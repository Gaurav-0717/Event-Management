const User = require("../models/User");
const { verifyToken, extractBearerToken } = require("../utils/auth");

/**
 * Protect a route by requiring a valid JWT.
 *
 * Flow:
 *  1. Read the Authorization header.
 *  2. Support the `Bearer <token>` scheme.
 *  3. Verify the JWT (rejects invalid / expired tokens).
 *  4. Load the user from MongoDB.
 *  5. Attach the authenticated user document to req.user.
 *
 * The user id and role ALWAYS come from the verified token + database lookup —
 * never from values supplied by the frontend.
 */
const protect = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, no token provided"));
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    res.status(401);
    if (error.name === "TokenExpiredError") {
      return next(new Error("Not authorized, token has expired"));
    }
    return next(new Error("Not authorized, token is invalid"));
  }

  try {
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      return next(new Error("Not authorized, user no longer exists"));
    }

    req.user = user;
    return next();
  } catch (error) {
    res.status(401);
    return next(new Error("Not authorized, user lookup failed"));
  }
};

module.exports = { protect };
