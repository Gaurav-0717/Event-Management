/**
 * Reusable authorization middleware.
 *
 * Usage:
 *   router.get('/admin-only', protect, requireRole('admin'), handler);
 *
 * Authorization is enforced on the backend — never rely on frontend
 * route protection for security. `req.user` is set by the `protect`
 * middleware from the verified JWT + database lookup.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized, no authenticated user"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Forbidden: insufficient permissions"));
    }

    return next();
  };
};

module.exports = { requireRole };
