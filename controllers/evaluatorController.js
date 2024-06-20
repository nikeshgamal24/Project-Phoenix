const Defense = require("../models/Defense");
const Project = require("../models/Project");
const Evaluation = require("../models/Evaluation");

const getDefenseBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    // Find event by ID and populate the author field
    const defense = await Defense.findById(req.params.id)
      .populate("rooms")
      .populate("event");

    // Check if event exists
    if (!defense) {
      return res.sendStatus(204);
    }

    //populate evalutator and projects inside defense
    // Map over each defense room  and populate evaluator and projects
    const populatedRooms = await Promise.all(
      defense.rooms.map(async (room) => {
        // Populate projects for the current defense
        const populatedProjecs = await room.populate("projects");
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

    // Send response
    return res.status(200).json({
      data: project,
    });
  } catch (error) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

const submitEvaluation = async (req, res) => {
  try {
    // console.log(req.body);
    if (
      !req?.body?.individualEvaluation.length ||
      !req?.body?.projectEvaluation ||
      !req?.body?.projectId ||
      !req?.body?.evaluatorId ||
      !req?.body?.defenseId ||
      !req?.body?.eventId
    ) {
      return res.status(400).json({
        message: "Required Credentials Missing",
      });
    }

    const evaluationType = req.body.evaluationType;
    const projectOf = await Project.findOne({
      _id: req.body.projectId,
    });

    //if no project found
    if (!projectOf) return res.sendStatus(404);

    // Get the start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    // Find evaluations done today
    const matchingEvaluation = await Evaluation.find({
      _id: { $in: projectOf[evaluationType].evaluations },
      project: req.body.projectId,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });

    const projectEvaluations = projectOf[evaluationType].evaluations;
    console.log("projectEvaluations");
    console.log(matchingEvaluation);

    //if there is evaluation done today then
    // tally the newly evaluation's judgement and today created evaluations
    if (matchingEvaluation) {
      const conflictExists = matchingEvaluation.some(evaluation => {  
        // If judgement does not match, return true to indicate conflict
        if (req.body.projectEvaluation.judgement !== evaluation.projectEvaluation.judgement) {
          return true; // Conflict found
        }
        return false; // No conflict
      });

      if (conflictExists) {
        return res.sendStatus(409); // Conflict
      }
    }

    //create a new evaluator, with credentials
    const newEvaluation = await Evaluation.create({
      individualEvaluation: req.body.individualEvaluation,
      projectEvaluation: req.body.projectEvaluation,
      project: req.body.projectId,
      evaluator: req.body.evaluatorId,
      defense: req.body.defenseId,
      event: req.body.eventId,
      evaluationType: evaluationType,
    });

    // if no evaluator is created
    if (!newEvaluation) return res.sendStatus(400);
    //if creation is success
    projectEvaluations.push(newEvaluation._id);

    //return if everything goes well
    //save project changes
    projectOf.save();
    return res.status(201).json({
      data: newEvaluation,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getDefenseBydId, getProjectBydId, submitEvaluation };
