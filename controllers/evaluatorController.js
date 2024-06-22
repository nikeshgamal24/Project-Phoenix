const Defense = require("../models/Defense");
const Project = require("../models/Project");
const Student = require("../models/Student");
const Evaluator = require("../models/Evaluator");
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

    const defenseType = defense.defenseType;

    //go throught each room and see the project's defenstype's defenses' isGraded and
    for (let i = 0; i < defense.rooms.length; i++) {
      let room = defense.rooms[i];
      let isGradedStatus = true;

      for (let j = 0; j < room.projects.length; j++) {
        let projectId = room.projects[j];
        const projectDoc = await Project.findOne({ _id: projectId });

        for (let k = 0; k < projectDoc[defenseType].defenses.length; k++) {
          let defensesObj = projectDoc[defenseType].defenses[k];
          if (!defensesObj.isGraded) {
            isGradedStatus = false;
            break;
          }
        }

        // If any project is not graded, no need to check further projects in this room
        if (!isGradedStatus) break;
      }

      //when the all the defenses isGraded then change the room isCompleted to true
      if (isGradedStatus) {
        room.isCompleted = true;
      }

      //if the room isCompleted status is true then remove the access code of the room evaluators from the database
      if (room.isCompleted) {
        console.log("room");
        console.log(room);
        room.evaluators.forEach(async (evaluatorId) => {
          const evaluatorDoc = await Evaluator.findOne({ _id: evaluatorId });
          evaluatorDoc.defense.forEach((defenseObj) => {
            const defenseIdFromParams = new ObjectId(req.params.id);
            if (defenseIdFromParams.equals(defenseObj.defenseId)) {
              defenseObj.accessCode = undefined;
            }
          });
          evaluatorDoc.save();
        });
      }
    }
    //if isGraded is true then update room's isCompleted to true and remove the access Code for the evalutaors

    // Check if event exists
    if (!defense) {
      return res.sendStatus(204);
    }

    //get check if the  defenses section's "isGraded" inside projects inside the rooms and only get the allow the projects whose isGraded is false

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
  } catch (err) {
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
    console.log("populatedEvaluations");
    console.log(populatedEvaluations);
    // const evaluationField = project[defenseType].evaluations;

    // Send response
    return res.status(200).json({
      data: project,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.status(500).json({ message: "Server error." });
  }
};

const submitEvaluation = async (req, res) => {
  try {
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
      !Array.isArray(individualEvaluation) ||
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
  
    const project = await Project.findOne({ _id: projectId });
    const defense = await Defense.findOne({ _id: defenseId });
  
    if (!project) return res.sendStatus(404);
  
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  
    const matchingEvaluation = await Evaluation.find({
      _id: { $in: project[evaluationType].evaluations },
      project: projectId,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
  
    const projectOfPhase = project[evaluationType];
  
    if (matchingEvaluation.length) {
      const conflictExists = matchingEvaluation.some((evaluation) => {
        if (projectEvaluation.judgement !== evaluation.projectEvaluation.judgement) {
          return true;
        }
  
        for (let i = 0; i < individualEvaluation.length; i++) {
          if (individualEvaluation[i].absent !== evaluation.individualEvaluation[i].absent) {
            return true;
          }
        }
  
        return false;
      });
  
      if (conflictExists) {
        return res.status(409).json({
          message: "Conflict data",
        });
      }
    }
  
    const formattedIndividualEvaluations = individualEvaluation.map((evaluation) => ({
      student: evaluation.member,
      performanceAtPresentation: evaluation.performanceAtPresentation,
      absent: evaluation.absent,
      projectTitleAndAbstract: evaluation.absent ? "0" : projectEvaluation.projectTitleAndAbstract,
      project: evaluation.absent ? "0" : projectEvaluation.project,
      objective: evaluation.absent ? "0" : projectEvaluation.objective,
      teamWork: evaluation.absent ? "0" : projectEvaluation.teamWork,
      documentation: evaluation.absent ? "0" : projectEvaluation.documentation,
      plagiarism: evaluation.absent ? "0" : projectEvaluation.plagiarism,
    }));
  
    const newEvaluation = await Evaluation.create({
      individualEvaluation: formattedIndividualEvaluations,
      projectEvaluation: projectEvaluation,
      project: projectId,
      evaluator: evaluatorId,
      defense: defenseId,
      event: eventId,
      evaluationType: evaluationType,
    });
  
    if (!newEvaluation) return res.sendStatus(400);
  
    projectOfPhase.evaluations.push(newEvaluation._id);
  
    for (const obj of projectOfPhase.defenses) {
      const evaluatorIdObj = new ObjectId(evaluatorId);
      let trueCount = 0;
  
      for (const evaluatorObj of obj.evaluators) {
        if (evaluatorIdObj.equals(evaluatorObj.evaluator)) {
          evaluatorObj.hasEvaluated = true;
        }
        if (evaluatorObj.hasEvaluated) {
          trueCount += 1;
        }
      }
  
      if (trueCount === obj.evaluators.length) {
        obj.isGraded = true;
      }
  
      if (obj.isGraded) {
        const projectEvaluations = await Evaluation.find({
          project: project._id,
          defense: obj.defense,
        });
  
        let projectJudgement = null;
        let previousJudgement = null;
        let judgementEquals = true;
  
        for (const evaluation of projectEvaluations) {
          previousJudgement = previousJudgement !== null ? previousJudgement : "";
          const currentJudgement = evaluation.projectEvaluation.judgement;
  
          if (currentJudgement !== -1) {
            if (previousJudgement !== "" && currentJudgement !== previousJudgement) {
              judgementEquals = false;
            }
            projectJudgement = currentJudgement;
          }
  
          previousJudgement = currentJudgement;
        }
  
        if (projectJudgement === judgementConfig.Accepted || projectJudgement === judgementConfig["Accepted Conditionally"]) {
          project[evaluationType].hasGraduated = true;
  
          if (project[evaluationType].hasGraduated) {
            const studentSavePromises = project.teamMembers.map(async (studentId) => {
              const student = await Student.findOne({ _id: studentId });
              const eventType = initializeEventTypeBasedOnBatch(student.batchNumber);
              console.log("*********student forward update progress section***********");
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
              return student.save();
            });
  
            await Promise.all(studentSavePromises);
          }
        } else {
          const studentSavePromises = project.teamMembers.map(async (studentId) => {
            const student = await Student.findOne({ _id: studentId });
            const eventType = initializeEventTypeBasedOnBatch(student.batchNumber);
            console.log("*********student backward update progress section***********");
  
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
                student.progressStatus = updateMajorProgressStatus(
                  progressStatusEligibilityCode[evaluationType].defenseFail
                );
                break;
              default:
                break;
            }
            return student.save();
          });
          console.log("******before report is to be removed*********");
          console.log(project[evaluationType].report);
  
          await Promise.all(studentSavePromises); // <- Missing line added here
  
          project[evaluationType].report = undefined;
  
          console.log("******after report is removed*********");
          console.log(project[evaluationType].report);
        }
      }
    }
  
    defense.evaluations.push(newEvaluation._id);
  
    await defense.save();
    await project.save();
    console.log("******after the report undefined is saved***************");
    console.log(project);
    console.log("******update completed********");
    return res.status(201).json({
      data: newEvaluation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
  
};

module.exports = { getDefenseBydId, getProjectBydId, submitEvaluation };
