const express = require("express");
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
} = require("../controllers/teamController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// Team CRUD routes
router.post("/", createTeam);
router.get("/", getTeams);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

// Member management routes
router.post("/:id/members", addTeamMember);
router.delete("/:id/members/:userId", removeTeamMember);

module.exports = router;
