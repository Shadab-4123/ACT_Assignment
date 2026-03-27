const mongoose = require("mongoose");

const dashboardItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["lead", "task", "user"],
      required: true,
    },
    status: {
      type: String,
      default: "active",
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DashboardItem", dashboardItemSchema);
