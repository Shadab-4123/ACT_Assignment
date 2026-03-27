const express = require("express");
const {
  register,
  login,
  getDashboard,
  createDashboardItem,
  updateDashboardItem,
  deleteDashboardItem,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/dashboard", protect, getDashboard);
router.post("/dashboard/items", protect, createDashboardItem);
router.put("/dashboard/items/:id", protect, updateDashboardItem);
router.delete("/dashboard/items/:id", protect, deleteDashboardItem);

module.exports = router;
