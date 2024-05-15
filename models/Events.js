const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    eventId: {
      type: String,
    },
    eventName: {
      type: String,
      required: [true, "Please, give a name for the event"],
    },
    description: {
      type: String,
    },
    eventTarget: {
      type: String,
      required: [true, "Please, mention event target"],
    },
    eventType: {
      type: String,
      required: [true, "Please, mention event type"],
    },
    eventStatus: {
      type: String,
      default:"101"
    },
    proposal: {
      phase: {
        type: String,
        default: "Phase 1",
      },
      defense: {
        type: Boolean,
      },
      defenseDate: {
        type: Date,
        default: null,
      },
      reportDeadline: {
        type: Date,
        defualt: null,
      },
    },
    mid: {
      phase: {
        type: String,
        default: "Phase 1",
      },
      defense: {
        type: Boolean,
      },
      defenseDate: {
        type: Date,
        default: null,
      },
      reportDeadline: {
        type: Date,
        defualt: null,
      },
    },
    final: {
      phase: {
        type: String,
        default: "Phase 1",
      },
      defense: {
        type: Boolean,
      },
      defenseDate: {
        type: Date,
        default: null,
      },
      reportDeadline: {
        type: Date,
        defualt: null,
      },
    },
    year: Number,
    author: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    projects: [{
      type: Schema.Types.ObjectId,
      ref: "Project",
    }],
    timeStamps: {
      type: Date,
      timestamps: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
