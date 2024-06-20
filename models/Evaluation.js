const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectEvaluationSchema = new Schema({
  projectTitleAndAbstract: {
    type: String,
    required: true,
  },
  project: {
    type: String,
    required: true,
  },
  objective: {
    type: String,
    required: true,
  },
  teamWork: {
    type: String,
    required: true,
  },
  documentation: {
    type: String,
    required: true,
  },
  plagiarism: {
    type: String,
    required: true,
  },
  judgement: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  outstanding: {
    type: Boolean,
    required: true,
  },
});


const individualEvaluationSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  performanceAtPresentation: {
    type: String,
    required: true,
  },
  absent: {
    type: Boolean,
    required: true,
  },

  projectEvaluation: {
    type: projectEvaluationSchema,
    required: true,
  },
});

const evaluationSchema = new Schema(
  {
    individualEvaluation: {
      type: [individualEvaluationSchema],
      required: true,
    },
    project: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    evaluator: {
      type: Schema.Types.ObjectId,
      ref: "Evaluator",
      required: true,
    },
    defense: {
      type: Schema.Types.ObjectId,
      ref: "Defense",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    evaluationType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

module.exports = Evaluation;
