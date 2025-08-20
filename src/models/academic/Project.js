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

// Indexes for better query performance
projectSchema.index({ projectCode: 1 }); // Unique index for project code
projectSchema.index({ event: 1 }); // Index for event-based queries
projectSchema.index({ status: 1 }); // Index for status filtering
projectSchema.index({ teamMembers: 1 }); // Index for team member queries
projectSchema.index({ 'supervisor.supervisorId': 1 }); // Index for supervisor queries
projectSchema.index({ categories: 1 }); // Index for category filtering
projectSchema.index({ createdAt: -1 }); // Index for sorting by creation date

module.exports = mongoose.model("Project", projectSchema);
