const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const defenseSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
    defenseType: {
      type: String,
      enum: ["PROPOSAL", "MID", "FINAL"],
    },
    defenseTime: {
      type: String,
    },
    defenseDate: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETE", "ARCHIVE"],
    },
    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room",
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
