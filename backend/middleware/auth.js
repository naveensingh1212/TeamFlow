const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

/**
 * Middleware to verify JWT token
 */
const auth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized to access this route");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    next();
  } catch (error) {
    throw new ApiError(401, "Token is invalid or expired");
  }
});

/**
 * Middleware to check if user is admin
 */
const admin = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can access this route");
  }
  next();
};

/**
 * Middleware to check user role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You don't have permission to access this route");
    }
    next();
  };
};

module.exports = { auth, admin, authorize };
