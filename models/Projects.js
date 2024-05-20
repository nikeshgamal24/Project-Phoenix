const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    projectCode: {
      type: String,
    },
    projectName: {
      type: String,
      required: [true, "Please, Enter your full name!"],
    },
    projectType:{
      type:String
    },
    projectDescription: String,
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
    status: {
      type: String,
      default: "101",
    },
    proposal: {
      phase: {
        type: String,
        default: "1",
      },
      reportPdf: {
        type: String,
      },
    },
    mid: {
      phase: {
        type: String,
        default: "1",
      },
      reportPdf: {
        type: String,
      },
    },
    final: {
      phase: {
        type: String,
        default: "1",
      },
      reportPdf: {
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
