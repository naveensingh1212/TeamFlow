const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "7d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or username already registered");
  }

  // Create new user
  const user = new User({
    username,
    email,
    password,
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: userResponse, token },
        "User registered successfully"
      )
    );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/signin
 * @access  Public
 */
const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user and select password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate token
  const token = generateToken(user._id);

  const userResponse = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: userResponse, token },
        "User logged in successfully"
      )
    );
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("teams");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.id;

  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;

  // Check if email already exists
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

/**
 * @desc    Search active users by email or username
 * @route   GET /api/auth/users?search=query
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const search = (req.query.search || "").trim();

  if (search.length < 2) {
    throw new ApiError(400, "Search must be at least 2 characters");
  }

  const users = await User.find({
    _id: { $ne: req.user.id },
    isActive: true,
    $or: [
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ],
  })
    .select("username email role")
    .limit(10);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

module.exports = {
  signup,
  signin,
  getProfile,
  updateProfile,
  searchUsers,
  generateToken,
};
