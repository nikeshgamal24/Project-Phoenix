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
    accessCode: {
      type: String,
    },
    role: {
      type: [Number],
    },
    isAssociated: {
      type: Boolean,
      default:false,
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
