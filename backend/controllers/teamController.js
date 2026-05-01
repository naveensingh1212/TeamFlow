const Team = require("../models/Team");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private
 */
const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Team name is required");
  }

  const team = await Team.create({
    name,
    description,
    owner: req.user.id,
    members: [
      {
        user: req.user.id,
        role: "admin",
      },
    ],
  });

  await team.populate([
    { path: "owner", select: "username email" },
    { path: "members.user", select: "username email" },
  ]);

  // Add team to user's teams
  await User.findByIdAndUpdate(req.user.id, {
    $push: { teams: team._id },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, team, "Team created successfully"));
});

/**
 * @desc    Get all teams for user
 * @route   GET /api/teams
 * @access  Private
 */
const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    isActive: true,
  })
    .populate("owner", "username email")
    .populate("members.user", "username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams fetched successfully"));
});

/**
 * @desc    Get single team
 * @route   GET /api/teams/:id
 * @access  Private
 */
const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate("owner", "username email")
    .populate("members.user", "username email");

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check access
  const hasAccess =
    team.owner.toString() === req.user.id ||
    team.members.some((m) => m.user.toString() === req.user.id);

  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this team");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Team fetched successfully"));
});

/**
 * @desc    Update team
 * @route   PUT /api/teams/:id
 * @access  Private
 */
const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check if user is owner or admin
  const userRole = team.members.find(
    (m) => m.user.toString() === req.user.id
  )?.role;

  if (team.owner.toString() !== req.user.id && userRole !== "admin") {
    throw new ApiError(403, "Only team admins can update this team");
  }

  const { name, description } = req.body;

  if (name) team.name = name;
  if (description !== undefined) team.description = description;

  await team.save();

  await team.populate([
    { path: "owner", select: "username email" },
    { path: "members.user", select: "username email" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Team updated successfully"));
});

/**
 * @desc    Add member to team
 * @route   POST /api/teams/:id/members
 * @access  Private (Admin only)
 */
const addTeamMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const team = await Team.findById(req.params.id);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check if user is owner or admin
  const userRole = team.members.find(
    (m) => m.user.toString() === req.user.id
  )?.role;

  if (team.owner.toString() !== req.user.id && userRole !== "admin") {
    throw new ApiError(403, "Only team admins can add members");
  }

  // Check if user already exists
  const memberExists = team.members.some(
    (m) => m.user.toString() === userId
  );

  if (memberExists) {
    throw new ApiError(409, "User is already a member of this team");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  team.members.push({
    user: userId,
    role: role || "member",
  });

  await team.save();

  // Add team to user's teams
  await User.findByIdAndUpdate(userId, {
    $addToSet: { teams: team._id },
  });

  await team.populate([
    { path: "owner", select: "username email" },
    { path: "members.user", select: "username email" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Member added successfully"));
});

/**
 * @desc    Remove member from team
 * @route   DELETE /api/teams/:id/members/:userId
 * @access  Private (Admin only)
 */
const removeTeamMember = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check if user is owner or admin
  const userRole = team.members.find(
    (m) => m.user.toString() === req.user.id
  )?.role;

  if (team.owner.toString() !== req.user.id && userRole !== "admin") {
    throw new ApiError(403, "Only team admins can remove members");
  }

  if (team.owner.toString() === req.params.userId) {
    throw new ApiError(400, "Team owner cannot be removed");
  }

  team.members = team.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );

  await team.save();

  // Remove team from user's teams
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { teams: team._id },
  });

  await team.populate([
    { path: "owner", select: "username email" },
    { path: "members.user", select: "username email" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Member removed successfully"));
});

/**
 * @desc    Delete team
 * @route   DELETE /api/teams/:id
 * @access  Private (Owner only)
 */
const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (team.owner.toString() !== req.user.id) {
    throw new ApiError(403, "Only team owner can delete this team");
  }

  team.isActive = false;
  await team.save();

  // Remove team from all members
  await User.updateMany(
    { teams: team._id },
    { $pull: { teams: team._id } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Team deleted successfully"));
});

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
};
