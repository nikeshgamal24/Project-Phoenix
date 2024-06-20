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

    const projectEvaluations = project[evaluationType].evaluations;

    //if there is evaluation done today then
    // tally the newly evaluation's judgement and today created evaluations
    if (matchingEvaluation) {
      const conflictExists = matchingEvaluation.some((evaluation) => {
        console.log("*****projectEvaluation.judgement******");
        console.log(projectEvaluation.judgement);

        let conflictFound = false; // Initialize a boolean to track conflict
      for(let i = 0;i<evaluation.individualEvaluation.length;i++){
          console.log("*****evaluation.projectEvaluation.judgement******");
          console.log(evaluation.individualEvaluation[i]);

          // Check if the first evaluation's judgment is "0" (absent case)
          if (evaluation.individualEvaluation[i].projectEvaluation.judgement === "0") {
            // Continue checking other evaluations
            continue;
          }

          console.log(projectEvaluation.judgement);
          console.log(evaluation.individualEvaluation[i].projectEvaluation.judgement);
          // Compare the judgment values
          if (
            projectEvaluation.judgement !==
            evaluation.individualEvaluation[i].projectEvaluation.judgement
          ) {
            // Set conflictFound to true if conflict detected
            console.log("inside the conflict return scope");
            conflictFound = true;
          }
        }

        // Return the conflictFound boolean to some() method
        return conflictFound;
      });

      console.log("********conflictExists********");
      console.log(conflictExists);

      if (conflictExists) {
        return res.sendStatus(409); // Conflict
      }
    }

    // Map projectEvaluation to each individualEvaluation object
    const formattedIndividualEvaluations = individualEvaluation.map(
      (evaluation) => ({
        student: evaluation.member, //here student ID is member
        performanceAtPresentation: evaluation.performanceAtPresentation,
        absent: evaluation.absent,
        projectEvaluation: {
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
          judgement: evaluation.absent ? "0" : projectEvaluation.judgement,
          feedback: evaluation.absent ? "0" : projectEvaluation.feedback,
          outstanding: evaluation.absent
            ? false
            : projectEvaluation.outstanding,
        },
      })
    );
    //create a new evaluator, with credentials
    const newEvaluation = await Evaluation.create({
      individualEvaluation: formattedIndividualEvaluations,
      project: projectId,
      evaluator: evaluatorId,
      defense: defenseId,
      event: eventId,
      evaluationType: evaluationType,
    });

    // if no evaluator is created
    if (!newEvaluation) return res.sendStatus(400);
    //if creation is success then push the newly created evaluation id to the project's defense type's evaluations array of object ids
    projectEvaluations.push(newEvaluation._id);

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
