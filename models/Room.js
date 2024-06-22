const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    room: {
      type: String,
    },

    evaluators: [
      {
        type: Schema.Types.ObjectId,
        ref: "Evaluator",
      },
    ],
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Room", roomSchema);
