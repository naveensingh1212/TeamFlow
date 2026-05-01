const Task = require("../models/Task");
const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    projectId,
    assignedTo,
    priority,
    dueDate,
    status,
    tags,
  } = req.body;

  if (!title || !projectId) {
    throw new ApiError(400, "Title and project ID are required");
  }

  // Check if project exists and user has access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const hasAccess =
    project.owner.toString() === req.user.id ||
    project.members.some((m) => m.user.toString() === req.user.id);

  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this project");
  }

  if (
    assignedTo &&
    !project.members.some((m) => m.user.toString() === assignedTo)
  ) {
    throw new ApiError(400, "Assignee must be a member of this project");
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo,
    createdBy: req.user.id,
    priority,
    status,
    dueDate: dueDate || undefined,
    tags: tags || [],
  });

  await task.populate([
    { path: "project", select: "name owner members" },
    { path: "assignedTo", select: "username email" },
    { path: "createdBy", select: "username email" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

/**
 * @desc    Get all tasks in a project
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const { projectId, status, priority, assignedTo } = req.query;

  const filter = {};
  let accessibleProjectIds = [];

  if (projectId) {
    // Check if user has access to project
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const hasAccess =
      project.owner.toString() === req.user.id ||
      project.members.some((m) => m.user.toString() === req.user.id);

    if (!hasAccess) {
      throw new ApiError(403, "You don't have access to this project");
    }

    filter.project = projectId;
  } else {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
      isActive: true,
    }).select("_id");

    accessibleProjectIds = projects.map((project) => project._id);
    filter.project = { $in: accessibleProjectIds };
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  const tasks = await Task.find(filter)
    .populate("project", "name owner members")
    .populate("assignedTo", "username email")
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("project", "name owner members")
    .populate("assignedTo", "username email")
    .populate("createdBy", "username email");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Check access
  const project = await Project.findById(task.project._id);
  const hasAccess =
    project.owner.toString() === req.user.id ||
    project.members.some((m) => m.user.toString() === req.user.id);

  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Check access
  const project = await Project.findById(task.project);
  if (!project) {
    throw new ApiError(404, "Task project not found");
  }

  const hasAccess =
    project.owner.toString() === req.user.id ||
    project.members.some((m) => m.user.toString() === req.user.id);

  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this task");
  }

  const { title, description, assignedTo, status, priority, dueDate, tags } = req.body;

  if (
    assignedTo &&
    !project.members.some((m) => m.user.toString() === assignedTo)
  ) {
    throw new ApiError(400, "Assignee must be a member of this project");
  }

  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;
  if (status) task.status = status;
  if (priority) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (tags) task.tags = tags;

  await task.save();

  await task.populate([
    { path: "project", select: "name owner members" },
    { path: "assignedTo", select: "username email" },
    { path: "createdBy", select: "username email" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Check access - only creator or project admin
  const project = await Project.findById(task.project);
  if (!project) {
    throw new ApiError(404, "Task project not found");
  }

  const userRole = project.members.find(
    (m) => m.user.toString() === req.user.id
  )?.role;

  const canDelete =
    task.createdBy.toString() === req.user.id ||
    project.owner.toString() === req.user.id ||
    userRole === "admin";

  if (!canDelete) {
    throw new ApiError(403, "You don't have permission to delete this task");
  }

  await Task.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

/**
 * @desc    Get dashboard stats
 * @route   GET /api/tasks/dashboard/stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get all projects for the user
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    isActive: true,
  });

  const projectIds = projects.map((p) => p._id);

  // Get task statistics
  const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
  const completedTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: "completed",
  });
  const overdueTasks = await Task.countDocuments({
    project: { $in: projectIds },
    isOverdue: true,
    status: { $ne: "completed" },
  });
  const inProgressTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: { $in: ["todo", "in-progress", "review"] },
  });

  // Get tasks by priority
  const tasksByPriority = await Task.aggregate([
    {
      $match: {
        project: { $in: projectIds },
      },
    },
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get tasks assigned to user
  const myTasks = await Task.find({
    project: { $in: projectIds },
    assignedTo: req.user.id,
  })
    .sort({ dueDate: 1 })
    .limit(10)
    .populate("project", "name")
    .populate("createdBy", "username email");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalTasks,
        completedTasks,
        overdueTasks,
        inProgressTasks,
        tasksByPriority,
        myTasks,
      },
      "Dashboard stats fetched successfully"
    )
  );
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardStats,
};
