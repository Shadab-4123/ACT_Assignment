const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const DashboardItem = require("../models/DashboardItem");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function normalizeType(type) {
  if (type === "leads") return "lead";
  if (type === "tasks") return "task";
  if (type === "users") return "user";
  return type;
}

async function createDefaultDashboardItems(userId) {
  const existingItems = await DashboardItem.countDocuments({ owner: userId });
  if (existingItems > 0) return;

  await DashboardItem.insertMany([
    { title: "Inbound lead from website", type: "lead", owner: userId },
    { title: "Follow-up with shortlisted candidate", type: "task", owner: userId },
    { title: "New team member onboarded", type: "user", owner: userId },
  ]);
}

function buildStats(items) {
  return items.reduce(
    (acc, item) => {
      if (item.type === "lead") acc.leads += 1;
      if (item.type === "task") acc.tasks += 1;
      if (item.type === "user") acc.users += 1;
      return acc;
    },
    { leads: 0, tasks: 0, users: 0 }
  );
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    await createDefaultDashboardItems(user._id);
    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during registration." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);
    await createDefaultDashboardItems(user._id);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login." });
  }
}

async function getDashboard(req, res) {
  try {
    const items = await DashboardItem.find({ owner: req.user.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      user: { name: req.user.name, email: req.user.email },
      stats: buildStats(items),
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard data." });
  }
}

async function createDashboardItem(req, res) {
  try {
    const { title, type, status } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required." });
    }

    const normalizedType = normalizeType(type);
    if (!["lead", "task", "user"].includes(normalizedType)) {
      return res.status(400).json({ message: "Type must be lead, task, or user." });
    }

    const item = await DashboardItem.create({
      title: title.trim(),
      type: normalizedType,
      status: status?.trim() || "active",
      owner: req.user.userId,
    });

    return res.status(201).json({
      message: "Dashboard item created.",
      item,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create dashboard item." });
  }
}

async function updateDashboardItem(req, res) {
  try {
    const { id } = req.params;
    const { title, type, status } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (status !== undefined) updates.status = status.trim();
    if (type !== undefined) {
      const normalizedType = normalizeType(type);
      if (!["lead", "task", "user"].includes(normalizedType)) {
        return res
          .status(400)
          .json({ message: "Type must be lead, task, or user." });
      }
      updates.type = normalizedType;
    }

    const item = await DashboardItem.findOneAndUpdate(
      { _id: id, owner: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Dashboard item not found." });
    }

    return res.status(200).json({ message: "Dashboard item updated.", item });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update dashboard item." });
  }
}

async function deleteDashboardItem(req, res) {
  try {
    const { id } = req.params;
    const item = await DashboardItem.findOneAndDelete({
      _id: id,
      owner: req.user.userId,
    });

    if (!item) {
      return res.status(404).json({ message: "Dashboard item not found." });
    }

    return res.status(200).json({ message: "Dashboard item deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete dashboard item." });
  }
}

module.exports = {
  register,
  login,
  getDashboard,
  createDashboardItem,
  updateDashboardItem,
  deleteDashboardItem,
};
