/**
 * Allow access only to authenticated admin users.
 *
 * IMPORTANT:
 * This middleware must be used AFTER protect middleware,
 * because protect attaches the authenticated user to req.user.
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized"));
  }

  if (req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }

  return next();
};

module.exports = { adminOnly };
