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
    projectType: {
      type: String,
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
      defenseId: {
        type: Schema.Types.ObjectId,
        ref: "Defense",
      },
      hasGraduated: {
        type: Boolean,
      },
      report: {
        filePath: {
          type: String,
        },
        submittedBy: {
          type: String,
        },
        submittedOn: {
          type: String,
        },
      },
      evaluations: [
        {
          type: Schema.Types.ObjectId,
          ref: "Evaluation",
        },
      ],
    },
    mid: {
      defenseId: {
        type: Schema.Types.ObjectId,
        ref: "Defense",
      },
      hasGraduated: {
        type: Boolean,
      },
      report: {
        filePath: {
          type: String,
        },
        submittedBy: {
          type: String,
        },
        submittedOn: {
          type: String,
        },
      },
      evaluations: [
        {
          type: Schema.Types.ObjectId,
          ref: "Evaluation",
        },
      ],
    },
    final: {
      defenseId: {
        type: Schema.Types.ObjectId,
        ref: "Defense",
      },
      hasGraduated: {
        type: Boolean,
      },
      report: {
        filePath: {
          type: String,
        },
        submittedBy: {
          type: String,
        },
        submittedOn: {
          type: String,
        },
      },
      evaluations: [
        {
          type: Schema.Types.ObjectId,
          ref: "Evaluation",
        },
      ],
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