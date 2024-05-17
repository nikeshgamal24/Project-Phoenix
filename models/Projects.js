const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    projectId: {
      type: String,
    },
    projectName: {
      type: String,
      required: [true, "Please, Enter your full name!"],
    },
    projectDescription: String,
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    proposal: {
      phase: {
        type: String,
        default: "1",
      },
      reportDeadline: {
        type: Date,
      },
      filePath: {
        type: String,
      },
    },
    mid: {
      phase: {
        type: String,
        default: "1",
      },
      reportDeadline: {
        type: Date,
      },
      filePath: {
        type: String,
      },
    },
    final: {
      phase: {
        type: String,
        default: "1",
      },
      reportDeadline: {
        type: Date,
      },
      filePath: {
        type: String,
      },
    },
    timeStamps: {
      type: Date,
      timestamps: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
