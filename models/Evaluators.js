const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const evaluatorSchema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please, Enter your full name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide a valid email address!"],
      unique: true,
      lowercase: true,
    },
    photo: String,
    accessCode: {
      type: String,
    },
    role: {
      type: [Number],
    },
    isAssignedDefense: {
      type: Boolean,
    },
    evaluatorType: {
      type: String,
      enum: ["internal", "external"],
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

module.exports = mongoose.model("Evaluator", evaluatorSchema);
