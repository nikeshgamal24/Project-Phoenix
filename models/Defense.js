const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const defenseSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
    defenseType: {
      type: String,
    },
    defenseTime: {
      type: String,
    },
    defenseDate: {
      type: String,
    },
    status: {
      type: String,
    },
    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
    evaluations:[
      {
        type: Schema.Types.ObjectId,
        ref: "Evaluation",
      },
    ],
    timeStamps: {
      type: Date,
      timestamps: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Defense", defenseSchema);
