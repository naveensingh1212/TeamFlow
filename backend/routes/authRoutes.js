const express = require("express");
const {
  signup,
  signin,
  getProfile,
  updateProfile,
  searchUsers,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/signin", signin);

// Protected routes
router.get("/users", auth, searchUsers);
router.get("/me", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;
