const Defense = require("../models/Defense");
const Project = require("../models/Project");
const Evaluation = require("../models/Evaluation");
const {
  determineDefenseType,
} = require("./utility functions/determineDefenseType");
const { ObjectId } = require("mongodb");

const getDefenseBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    // Find event by ID and populate the author field
    const defense = await Defense.findById(req.params.id)
      .populate("rooms")
      .populate("event")
      .populate("evaluations");

    // Check if event exists
    if (!defense) {
      return res.sendStatus(204);
    }

    //populate evalutator and projects inside defense
    // Map over each defense room  and populate evaluator and projects
    const populatedRooms = await Promise.all(
      defense.rooms.map(async (room) => {
        // Populate projects for the current defense
        const populatedProjecs = await room.populate({
          path: "projects",
          populate: { path: "teamMembers" },
        });

        //populate teamMembers that reside inside projects

        // populate evaluators
        const populatedEvaluator = await room.populate("evaluators");
        return { populatedProjecs, populatedEvaluator };
      })
    );

    // Send response
    return res.status(200).json({
      data: defense,
    });
  } catch (error) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

const getProjectBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    // Find event by ID and populate the author field
    const project = await Project.findById(req.params.id)
      .populate("teamMembers")
      .populate("event");

    // Check if event exists
    if (!project) {
      return res.sendStatus(204);
    }

    //extract progressStatus of the student
    const progressStatus = project.teamMembers[0].progressStatus;
    const defenseType = determineDefenseType(progressStatus);
    // console.log(progressStatus, defenseType);
    const populatedEvaluations = await project[defenseType].populate(
      "evaluations"
    );
    // console.log(populatedEvaluations);
    const evaluationField = project[defenseType].evaluations;

    // Send response
    return res.status(200).json({
      data: { ...project.toObject() },
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

const submitEvaluation = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      individualEvaluation,
      projectEvaluation,
      projectId,
      evaluatorId,
      defenseId,
      eventId,
      evaluationType,
    } = req.body;

    if (
      !individualEvaluation.length ||
      !projectEvaluation ||
      !projectId ||
      !evaluatorId ||
      !defenseId ||
      !eventId
    ) {
      return res.status(400).json({
        message: "Required Credentials Missing",
      });
    }

    const project = await Project.findOne({
      _id: req.body.projectId,
    });
    const defense = await Defense.findOne({
      _id: req.body.defenseId,
    });

    //if no project found
    if (!project) return res.sendStatus(404);

    // Get the start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    // Find evaluations done today
    const matchingEvaluation = await Evaluation.find({
      _id: { $in: project[evaluationType].evaluations },
      project: req.body.projectId,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    console.log("****matchingEvaluation**");
    console.log(matchingEvaluation);

    const projectOfPhase = project[evaluationType];
    console.log("****projectOfPhase**");
    console.log(projectOfPhase);
    //if there is evaluation done today then
    // tally the newly evaluation's judgement and today created evaluations
    if (matchingEvaluation) {
      const conflictExists = matchingEvaluation.some((evaluation) => {
        console.log("*****projectEvaluation.judgement******");
        console.log(projectEvaluation.judgement);
        console.log(evaluation);
        let conflictFound = false; // Initialize a boolean to track conflict
        console.log(
          "*****evaluation.individualEvaluation[i].projectEvaluation.judgement******"
        );
        console.log(evaluation.projectEvaluation.judgement);

        console.log(projectEvaluation.judgement);
        console.log(evaluation.projectEvaluation.judgement);
        // Compare the judgment values
        if (
          projectEvaluation.judgement !== evaluation.projectEvaluation.judgement
        ) {
          // Set conflictFound to true if conflict detected
          console.log("inside the conflict return scope");
          conflictFound = true;
        }

        // Return the conflictFound boolean to some() method
        return conflictFound;
      });

      console.log("********conflictExists********");
      console.log(conflictExists);

      if (conflictExists) {
        return res.status(409).json({
          "message":"Conflict data",
        }); // Conflict
      }
    }

    // Map projectEvaluation to each individualEvaluation object
    const formattedIndividualEvaluations = individualEvaluation.map(
      (evaluation) => ({
        student: evaluation.member, //here student ID is member
        performanceAtPresentation: evaluation.performanceAtPresentation,
        absent: evaluation.absent,

        projectTitleAndAbstract: evaluation.absent
          ? "0"
          : projectEvaluation.projectTitleAndAbstract,
        project: evaluation.absent ? "0" : projectEvaluation.project,
        objective: evaluation.absent ? "0" : projectEvaluation.objective,
        teamWork: evaluation.absent ? "0" : projectEvaluation.teamWork,
        documentation: evaluation.absent
          ? "0"
          : projectEvaluation.documentation,
        plagiarism: evaluation.absent ? "0" : projectEvaluation.plagiarism,
      })
    );
    //create a new evaluator, with credentials
    const newEvaluation = await Evaluation.create({
      individualEvaluation: formattedIndividualEvaluations,
      projectEvaluation: projectEvaluation,
      project: projectId,
      evaluator: evaluatorId,
      defense: defenseId,
      event: eventId,
      evaluationType: evaluationType,
    });

    // if no evaluator is created
    if (!newEvaluation) return res.sendStatus(400);
    //if creation is success then push the newly created evaluation id to the project's defense type's evaluations array of object ids

    //push the newEvaluation id to the project phase evaulation array
    projectOfPhase.evaluations.push(newEvaluation._id);

    //update the evaluator hasEvaluated inside project evaluationType's evaluators
    projectOfPhase.defenses.forEach(async (obj) => {
      const evaluatorIdObj = new ObjectId(evaluatorId);
      let trueCount = 0;
      //this is the evaluators
      obj.evaluators.forEach((evaluatorObj) => {
        console.log(evaluatorId, evaluatorObj.evaluator);
        // Compare the two ObjectId values
        if (evaluatorIdObj.equals(evaluatorObj.evaluator)) {
          evaluatorObj.hasEvaluated = true;
        }
        if (evaluatorObj.hasEvaluated) {
          trueCount += 1;
        }
      });
      console.log("trueCount", trueCount);

      //if all the evaluators have submitted evaluation ten isGraded update to true
      if (trueCount === obj.evaluators.length) {
        console.log("section for changing hasGraded section");
        obj.isGraded = true;
      }

      //updating the hasGradutated: if the isGraded is true then checking for the judment
      //i.e. if judgement is 0 or 1 that is accepted and accepted conditionally then hasGraduated will update to true
      // and update the student progress status accordingly

      if (obj.isGraded) {
        //checking the judgement
        //get search the evaluations using projectId and defenseId then get the judgement of the all the evaluations
        const projectEvaluations = await Evaluation.find({
          project: project._id,
          defense: obj.defense,
        });

        //check the judgements are same or not
        let projectJudgement = null;
        let previousJudgement = null;
        let judgementEquals = true;

        projectEvaluations.forEach((evaluation) => {
          console.log("individualEvaluation");
            previousJudgement =
              previousJudgement !== null ? previousJudgement : "";
            const currentJudgement =evaluation.projectEvaluation.judgement;

            console.log(previousJudgement, currentJudgement);

            if (currentJudgement !== -1) {
              if (
                previousJudgement !== "" &&
                currentJudgement !== previousJudgement
              ) {
                judgementEquals = false;
              }
              projectJudgement = currentJudgement;
            }

            previousJudgement = currentJudgement;
   
        });

        console.log("judgement-verdict", projectJudgement);
        //based on the judgement update the teamMembers progressStatus ALSO CONSIDERING THE EVALUATIONTYPE
      }
      //if judgemnt is 2 or 3 that is re-defense or re-jected then backtrack the progress status of the student
    });

    //update defense evaluation field to with the newly created
    defense.evaluations.push(newEvaluation._id);

    //return if everything goes well
    //save project changes
    project.save();
    defense.save();
    return res.status(201).json({
      data: newEvaluation,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getDefenseBydId, getProjectBydId, submitEvaluation };
