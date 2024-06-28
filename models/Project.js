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
    progressLogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProgressLog",
      },
    ],
    supervisor: {
      supervisorId: { type: Schema.Types.ObjectId, ref: "Supervisor" },
      mid: {
        approved: {
          type: Boolean,
          default: false,
        },
        approvedDate: {
          type: Date,
        },
      },
      final: {
        approved: {
          type: Boolean,
          default: false,
        },
        approvedDate: {
          type: Date,
        },
      },
    },
    proposal: {
      defenses: {
        type: [
          {
            defense: {
              type: Schema.Types.ObjectId,
              ref: "Defense",
            },
            evaluators: [
              {
                evaluator: {
                  type: Schema.Types.ObjectId,
                  ref: "Evaluator",
                },
                hasEvaluated: {
                  type: Boolean,
                  default: false,
                },
              },
            ],
            isGraded: {
              type: Boolean,
              default: false,
            },
          },
        ],
        default: [],
      },
      hasGraduated: {
        type: Boolean,
        default: false,
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
      defenses: {
        type: [
          {
            defense: {
              type: Schema.Types.ObjectId,
              ref: "Defense",
            },
            evaluators: [
              {
                evaluator: {
                  type: Schema.Types.ObjectId,
                  ref: "Evaluator",
                },
                hasEvaluated: {
                  type: Boolean,
                  default: false,
                },
              },
            ],
            isGraded: {
              type: Boolean,
              default: false,
            },
          },
        ],
        default: [],
      },
      hasGraduated: {
        type: Boolean,
        default: false,
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
      defenses: {
        type: [
          {
            defense: {
              type: Schema.Types.ObjectId,
              ref: "Defense",
            },
            evaluators: [
              {
                evaluator: {
                  type: Schema.Types.ObjectId,
                  ref: "Evaluator",
                },
                hasEvaluated: {
                  type: Boolean,
                  default: false,
                },
              },
            ],
            isGraded: {
              type: Boolean,
              default: false,
            },
          },
        ],
        default: [],
      },
      hasGraduated: {
        type: Boolean,
        default: false,
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
    categories: {
      type: [String],
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
