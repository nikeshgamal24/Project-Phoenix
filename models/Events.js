const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  eventName: {
    type: String,
    required: [true, "Please, give a name for the event"],
  },
  description: {
    type: String,
  },
  eventTarget: {
    type: String,
    enum: ["BESE", "BEIT", "BECE", "BCA", "BEELX", "ALL"],
    required: [true, "Please, mention event target"],
  },
  eventType: {
    type: String,
    enum: ["FIRST", "MINOR", "MAJOR"],
    required: [true, "Please, mention event type"],
  },
  proposal: {
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
    ref:'Admin'
  },
});

module.exports = mongoose.model("Event", eventSchema);
