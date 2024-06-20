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
    contact:{
     type:String,
    },
    currentDefense:{
      type:Schema.Types.ObjectId,
      ref:"Defense"
    },
    defense: [
      {
        defenseId: {
          type: Schema.Types.ObjectId,
          ref: "Defense",
        },
        accessCode: {
          type: String,
        },
      },
    ],
    refreshToken: {
      type: String,
    },
    role: {
      type: [Number],
    },
    evaluatorType: {
      type: String,
    },
    designation:{
      type:String,
    },
    institution:{
      type:String,
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
