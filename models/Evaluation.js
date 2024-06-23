const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectEvaluationSchema = new Schema({
  projectTitleAndAbstract: {
    type: String,
  },
  project: {
    type: String,
  },
  objective: {
    type: String,
  },
  teamWork: {
    type: String,
  },
  documentation: {
    type: String,
  },
  plagiarism: {
    type: String,
  },
  feedbackIncorporated: {
    type: String,
  },
  workProgress: {
    type: String,
  },
  judgement: {
    type: String,
  },
  feedback: {
    type: String,
  },
  outstanding: {
    type: Boolean,
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
  projectTitleAndAbstract: {
    type: String,
  },
  project: {
    type: String,
  },
  objective: {
    type: String,
  },
  teamWork: {
    type: String,
  },
  documentation: {
    type: String,
  },
  plagiarism: {
    type: String,
  },
 feedbackIncorporated: {
    type: String,
  },
  workProgress: {
    type: String,
  },
});

const evaluationSchema = new Schema(
  {
    individualEvaluation: {
      type: [individualEvaluationSchema],
      required: true,
    },
    projectEvaluation: {
      type: projectEvaluationSchema,
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
