const express = require("express");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addProjectMember,
  removeProjectMember,
  deleteProject,
} = require("../controllers/projectController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// Project CRUD routes
router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Member management routes
router.post("/:id/members", addProjectMember);
router.delete("/:id/members/:userId", removeProjectMember);

module.exports = router;
