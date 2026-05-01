const Project = require("../models/Project");
const User = require("../models/User");
const Team = require("../models/Team");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, description, team, members, dueDate } = req.body;

  if (!name) {
    throw new ApiError(400, "Project name is required");
  }

  let projectMembers = [
    {
      user: req.user.id,
      role: "admin",
    },
  ];

  if (team) {
    const selectedTeam = await Team.findById(team);
    if (!selectedTeam || !selectedTeam.isActive) {
      throw new ApiError(404, "Team not found");
    }

    const hasTeamAccess =
      selectedTeam.owner.toString() === req.user.id ||
      selectedTeam.members.some((m) => m.user.toString() === req.user.id);

    if (!hasTeamAccess) {
      throw new ApiError(403, "You don't have access to this team");
    }

    projectMembers = selectedTeam.members.map((member) => ({
      user: member.user,
      role: member.role,
    }));

    if (!projectMembers.some((member) => member.user.toString() === req.user.id)) {
      projectMembers.push({
        user: req.user.id,
        role: "admin",
      });
    }
  }

  const project = await Project.create({
    name,
    description,
    owner: req.user.id,
    team: team || undefined,
    members: projectMembers,
    dueDate: dueDate || undefined,
  });

  await project.populate([
    { path: "owner", select: "username email" },
    { path: "team" },
    { path: "members.user", select: "username email" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

/**
 * @desc    Get all projects for user
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    isActive: true,
  })
    .populate("owner", "username email")
    .populate("team", "name")
    .populate("members.user", "username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("owner", "username email")
    .populate("team")
    .populate("members.user", "username email");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check if user has access
  const hasAccess =
    project.owner.toString() === req.user.id ||
    project.members.some((m) => m.user.toString() === req.user.id);

  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check if user is owner or admin
  const userRole = project.members.find(
    (m) => m.user.toString() === req.user.id
  )?.role;

  if (
    project.owner.toString() !== req.user.id &&
    userRole !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to update this project");
  }

  const { name, description, status, dueDate } = req.body;

  if (name) project.name = name;
  if (description) project.description = description;
  if (status) project.status = status;
  if (dueDate) project.dueDate = dueDate;

  await project.save();

  await project.populate([
    { path: "owner", select: "username email" },
    { path: "team" },
    { path: "members.user", select: "username email" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Private (Admin only)
 */
const addProjectMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check if user is owner or admin
  const userRole = project.members.find(
    (m) => m.user.toString() === req.user.id
  )?.role;

  if (project.owner.toString() !== req.user.id && userRole !== "admin") {
    throw new ApiError(403, "Only project admins can add members");
  }

  // Check if user already exists
  const memberExists = project.members.some(
    (m) => m.user.toString() === userId
  );

  if (memberExists) {
    throw new ApiError(409, "User is already a member of this project");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  project.members.push({
    user: userId,
    role: role || "member",
  });

  await project.save();
  await project.populate([
    { path: "owner", select: "username email" },
    { path: "team", select: "name" },
    { path: "members.user", select: "username email" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Member added successfully"));
});

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (Admin only)
 */
const removeProjectMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check if user is owner or admin
  const userRole = project.members.find(
    (m) => m.user.toString() === req.user.id
  )?.role;

  if (project.owner.toString() !== req.user.id && userRole !== "admin") {
    throw new ApiError(403, "Only project admins can remove members");
  }

  if (project.owner.toString() === req.params.userId) {
    throw new ApiError(400, "Project owner cannot be removed");
  }

  project.members = project.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );

  await project.save();
  await project.populate([
    { path: "owner", select: "username email" },
    { path: "team", select: "name" },
    { path: "members.user", select: "username email" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Member removed successfully"));
});

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Owner only)
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.owner.toString() !== req.user.id) {
    throw new ApiError(403, "Only project owner can delete this project");
  }

  project.isActive = false;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addProjectMember,
  removeProjectMember,
  deleteProject,
};
