const Defense = require("../models/Defense");
const Project = require("../models/Project");
const Student = require("../models/Student");
const Evaluation = require("../models/Evaluation");
const {
  determineDefenseType,
} = require("./utility functions/determineDefenseType");
const { ObjectId } = require("mongodb");
const judgementConfig = require("../config/judgementConfig");
const progressStatusEligibilityCode = require("../config/progressStatusEligibilityCode");
const {
  updateProjectFirstProgressStatus,
} = require("./utility functions/updateProjectFirstProgressStatus");
const {
  updateMinorProgressStatus,
} = require("./utility functions/updateMinorProgressStatus");
const {
  updateMajorProgressStatus,
} = require("./utility functions/updateMajorProgressStatus");
const {
  initializeEventTypeBasedOnBatch,
} = require("./utility functions/initializeEventTypeBasedOnBatch");

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

    console.log("*****project*******");
    console.log(project);
    //extract progressStatus of the student
    const progressStatus = project.teamMembers[0].progressStatus;
    console.log("*****progressStatus*****");
    console.log(progressStatus);
    const defenseType = determineDefenseType(progressStatus);
    console.log("defenseType");
    console.log(defenseType);
    // console.log(progressStatus, defenseType);
    const populatedEvaluations = await project[defenseType].populate({
      path: "evaluations",
      populate: { path: "evaluator" },
    });
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
        // Compare the judgment values between two evaluation
        if (
          projectEvaluation.judgement !== evaluation.projectEvaluation.judgement
        ) {
          // Set conflictFound to true if conflict detected
          console.log("inside the conflict return scope");
          conflictFound = true;
        }

        //comparing the individual absent section if there is any mismatch then return conflict
        for (let i = 0; i < individualEvaluation.length; i++) {
          if (
            individualEvaluation[i].absent !==
            evaluation.individualEvaluation[i].absent
          ) {
            conflictFound = true;
          }
        }

        // Return the conflictFound boolean to some() method
        return conflictFound;
      });

      console.log("********conflictExists********");
      console.log(conflictExists);

      if (conflictExists) {
        return res.status(409).json({
          message: "Conflict data",
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
        console.log("***before updating to hasEvaluated****");
        console.log();
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
          const currentJudgement = evaluation.projectEvaluation.judgement;

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
        //i.e. if judgement is 0 or 1 that is accepted and accepted conditionally then hasGraduated will update to true
        console.log(
          projectJudgement === judgementConfig.Accepted ||
            projectJudgement === judgementConfig["Accepted Conditionally"]
        );
        if (
          projectJudgement === judgementConfig.Accepted ||
          projectJudgement === judgementConfig["Accepted Conditionally"]
        ) {
          //update project defense type's hasGraduated section to true
          console.log("****hasGraduated*******");
          console.log(project[evaluationType].hasGraduated);
          project[evaluationType].hasGraduated = true;
          project.save(); // saves updates to the project
          //update the student status based on the
          if (project[evaluationType].hasGraduated) {
            project.teamMembers.forEach(async (studentId) => {
              const student = await Student.findOne({ _id: studentId });
              console.log("***studnet******");
              console.log(student);
              const eventType = initializeEventTypeBasedOnBatch(
                student.batchNumber
              );
              console.log("*****eventType*****");
              console.log(eventType);
              //update the progress status
              switch (eventType) {
                case "0":
                  student.progressStatus = updateProjectFirstProgressStatus(
                    progressStatusEligibilityCode[evaluationType].defensePass
                  );
                  break;
                case "1":
                  student.progressStatus = updateMinorProgressStatus(
                    progressStatusEligibilityCode[evaluationType].defensePass
                  );
                  break;
                case "2":
                  student.progressStatus = updateMajorProgressStatus(
                    progressStatusEligibilityCode[evaluationType].defensePass
                  );
                  break;
                default:
                  break;
              }
              student.save(); //save the updates for forward update
            });
          }
        } else {
          //if judgemnt is 2 or 3 that is re-defense or re-jected then backtrack the progress status of the student4
          console.log("backtrack section");
          project.teamMembers.forEach(async (studentId) => {
            const student = await Student.findOne({ _id: studentId });
            console.log("***student******");
            console.log(student);
            const eventType = initializeEventTypeBasedOnBatch(
              student.batchNumber
            );
            console.log("*****eventType*****");
            console.log(eventType);

            //update the progress status
            switch (eventType) {
              case "0":
                student.progressStatus = updateProjectFirstProgressStatus(
                  progressStatusEligibilityCode[evaluationType].defenseFail
                );
                break;
              case "1":
                student.progressStatus = updateMinorProgressStatus(
                  progressStatusEligibilityCode[evaluationType].defenseFail
                );
                break;
              case "2":
                console.log(
                  "progressStatusEligibilityCode[evaluationType].defenseFail"
                );
                console.log(
                  progressStatusEligibilityCode[evaluationType].defenseFail
                );
                student.progressStatus = updateMajorProgressStatus(
                  progressStatusEligibilityCode[evaluationType].defenseFail
                );
                console.log("**********updateMajorProgressStatus*******");
                console.log(
                  updateMajorProgressStatus(
                    progressStatusEligibilityCode[evaluationType].defenseFail
                  )
                );
                console.log(student.progressStatus);
                break;
              default:
                break;
            }
            console.log("*****after bactracking****");
            console.log(student);
            student.save(); //save the updates for backward update
            console.log("*****after bactracking save****");
            console.log(student);
          });
        }
      }
    });

    //update defense evaluation field to with the newly created
    defense.evaluations.push(newEvaluation._id);

    //return if everything goes well
    //save project changes
    project.save();
    defense.save();

    console.log("******update completed********");
    return res.status(201).json({
      data: newEvaluation,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getDefenseBydId, getProjectBydId, submitEvaluation };
