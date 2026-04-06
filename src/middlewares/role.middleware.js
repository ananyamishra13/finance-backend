const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You don't have permission to do this.",
      });
    }
    next();
  };
};

module.exports = authorize;