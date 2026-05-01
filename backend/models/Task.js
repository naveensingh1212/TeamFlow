const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "completed", "blocked"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    attachments: [String],
  },
  { timestamps: true }
);

// Update isOverdue before saving
taskSchema.pre("save", function (next) {
  if (this.dueDate && this.dueDate < new Date() && this.status !== "completed") {
    this.isOverdue = true;
  } else {
    this.isOverdue = false;
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
