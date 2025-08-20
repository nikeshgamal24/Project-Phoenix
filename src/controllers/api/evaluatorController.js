const Defense = require("../../models/academic/Defense");
const Project = require("../../models/academic/Project");
const Student = require("../../models/user/Student");
const Evaluator = require("../../models/user/Evaluator");
const Room = require("../../models/system/Room");
const Evaluation = require("../../models/academic/Evaluation");
const {
  determineDefenseType,
} = require("../helpers/evaluation/determineDefenseType");
const { ObjectId } = require("mongodb");
const midJudgementConfig = require("../../config/constants/midJudgementConfig");
const progressStatusEligibilityCode = require("../../config/constants/progressStatusEligibilityCode");
const {
  updateProjectFirstProgressStatus,
} = require("../helpers/project/updateProjectFirstProgressStatus");
const {
  updateMinorProgressStatus,
} = require("../helpers/project/updateMinorProgressStatus");
const {
  updateMajorProgressStatus,
} = require("../helpers/project/updateMajorProgressStatus");
const {
  initializeEventTypeBasedOnBatch,
} = require("../helpers/project/initializeEventTypeBasedOnBatch");
const eventStatusList = require("../../config/constants/eventStatusList");
const proposalJudgementConfig = require("../../config/constants/proposalJudgementConfig");
const defenseTypeCode = require("../../config/constants/defenseTypeCode");
const { finalJudgementConfig } = require("../../config/constants/finalJudgementConfig");
const {
  determineConflictExistsStatus,
} = require("../helpers/evaluation/determineConflictExistsStatus");
const {
  determineAllProjectsEvaluatedByEvaluator,
} = require("../helpers/evaluation/determineAllProjectsEvaluatedByEvaluator");
// require("dotenv").config();

// const Queue = require("bull");
// const {
//   REDIS_URI,
//   REDIS_PORT,
//   REDIS_TOKEN,
// } = require("../config/redisCredentials");

// const evaluatorQueue = new Queue("evaluatorqueue", {
//   redis: {
//     port: REDIS_PORT,
//     host: REDIS_URI,
//     password: REDIS_TOKEN,
//     tls: {},
//   },
// });

const getDefenseBydId = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }

  try {
    const defense = await Defense.findById(req.params.id)
      .populate({
        path: "rooms",
        populate: [
          { path: "evaluators" },
          {
            path: "projects",
            populate: { path: "teamMembers" },
          },
        ],
      })
      .populate("event")
      .populate("evaluations");

    // // Find event by ID and populate the relevant fields
    // const defense = await Defense.findById(req.params.id)
    //   .populate("rooms")
    //   .populate("event")
    //   .populate("evaluations");

    // Check if event exists
    if (!defense) {
      return res.sendStatus(204);
    }

    const defenseType = defense.defenseType;
    let allRoomsCompleted = true;

    // Go through each room
    for (const room of defense.rooms) {
      // Fetch the projects for the room in one query
      const projects = await Project.find({ _id: { $in: room.projects } });
      // console.log("🚀 ~ getDefenseBydId ~ projects:", projects);

      // for (const project of projects) {
      //   for (const defenseObj of project[defenseType].defenses) {
      //     if (!defenseObj.isGraded) {
      //       isGradedStatus = false;
      //       break;
      //     }
      //   }
      //   if (!isGradedStatus) break;
      // }

      let isGradedStatus = true;
      for (const project of projects) {
        if (
          !project[defenseType].defenses.every((defenseObj) => {
            // console.log("🚀 ~ getDefenseBydId ~ defenseObj:", defenseObj);
            return defenseObj.isGraded;
          })
        ) {
          isGradedStatus = false;
          break;
        }
      }

      // console.log("🚀 ~ getDefenseBydId ~ isGradedStatus:", isGradedStatus);
      // If all projects in the room are graded, mark the room as completed
      if (isGradedStatus) {
        room.isCompleted = true;
        // console.log("🚀 ~ getDefenseBydId ~ room:", room);
      } else {
        allRoomsCompleted = false;
      }

      // Save the updated room
      await room.save();
      // console.log("🚀 ~ getDefenseBydId ~ room:", room);
    }

    // Update the defense status if all rooms are completed
    console.log("🚀 ~ getDefenseBydId ~ allRoomsCompleted:", allRoomsCompleted);
    if (allRoomsCompleted) {
      defense.status = eventStatusList.complete; // 105 i.e. complete
    }

    // Populate evaluators and projects within the rooms for the response
    // await Promise.all(
    //   defense.rooms.map(async (room) => {
    //     await room.populate({
    //       path: "projects",
    //       populate: { path: "teamMembers" },
    //     });
    //     await room.populate("evaluators");
    //   })
    // );

    // Save the updated defense
    await defense.save();

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
      .populate("event")
      .populate({
        path: "proposal.evaluations",
        populate: { path: "evaluator" },
      })
      .populate({
        path: "mid.evaluations",
        populate: { path: "evaluator" },
      })
      .populate({
        path: "final.evaluations",
        populate: { path: "evaluator" },
      });

    // Check if event exists
    if (!project) {
      return res.sendStatus(204);
    }
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
    //request body received
    const {
      individualEvaluation,
      projectEvaluation,
      projectId,
      evaluatorId,
      defenseId,
      eventId,
      evaluationType,
      roomId,
    } = req.body;

    if (
      !Array.isArray(individualEvaluation) ||
      !individualEvaluation.length ||
      !projectEvaluation ||
      !projectId ||
      !evaluatorId ||
      !defenseId ||
      !eventId ||
      !roomId
    ) {
      return res.status(400).json({
        message: "Required Credentials Missing",
      });

      // return { statusCode: 400 };
    }

    const project = await Project.findOne({ _id: projectId });
    console.log("🚀 ~ submitEvaluation ~ project:", project);
    const defense = await Defense.findOne({ _id: defenseId });
    console.log("🚀 ~ submitEvaluation ~ defense:", defense);
    const room = await Room.findOne({ _id: roomId });
    console.log("🚀 ~ submitEvaluation ~ room:", room);

    const matchingEvaluations = await Evaluation.find({
      _id: { $in: project[evaluationType].evaluations },
      project: projectId,
      defense: defenseId,
    });
    console.log(
      "🚀 ~ submitEvaluation ~ matchingEvaluations:",
      matchingEvaluations
    );

    if (matchingEvaluations.length) {
      console.log(
        "🚀 ~ submitEvaluation ~ matchingEvaluation.length:",
        matchingEvaluations.length
      );

      //check for the conflict if exists in judgemnt
      const conflictExists = determineConflictExistsStatus({
        matchingEvaluations: matchingEvaluations,
        individualEvaluation: individualEvaluation,
        projectEvaluation: projectEvaluation,
      });

      console.log("🚀 ~ submitEvaluation ~ conflictExists:", conflictExists);
      if (conflictExists) {
        return res.status(409).json({
          message: "Conflict data",
        });
        // return { statusCode: 409 };
      }
    }

    //findin obj i.e.project[evaluationType]'s defense

    //find defense that matches with the defenseId that we have
    //find the specific defense object where an evaluator[defense.evaluators' evaluator] matches evaluatorId
    //projectSubEvent : proposal, mid or final
    const projectSubEvent = project[evaluationType];
    const obj = projectSubEvent.defenses.find((defense) => {
      return defense.evaluators.some((evaluator) => {
        console.log(
          "🚀 ~ returndefense.evaluators.some ~ evaluator:",
          evaluator.evaluator.toString()
        );
        console.log(
          "🚀 ~ returndefense.evaluators.some ~ evaluatorId ===evaluator.evaluator.toSting():",
          evaluatorId === evaluator.evaluator.toString()
        );
        return evaluatorId === evaluator.evaluator.toString();
      });
    });
    console.log("🚀 ~ obj ~ obj:", obj);

    //if no matching object is found
    if (!obj) return res.status(404).json({ message: "Defense Not Found" });
    // if (!obj) return { statusCode: 404 };

    //if object is found and isGraded is false i.e. all evaluation is not updated
    //if obj.isGraded is tru then go directly to end section
    if (!obj.isGraded) {
      //update hasEvaluator for the evaluation by the evaluator
      obj.evaluators.forEach((evaluatorObj) => {
        if (evaluatorObj.evaluator.toString() === evaluatorId) {
          evaluatorObj.hasEvaluated = true;
        }
      });
      console.log("🚀 ~ obj after haseEvaluated section ~ obj:", obj);

      //determing obj.isGraded status
      //for every evaluatorObj is hasEvaluated is true every() will return true if encounter false if any iteration it returns false
      const allEvaluatedResult = obj.evaluators.every(
        (evaluatorObj) => evaluatorObj.hasEvaluated
      );

      obj.isGraded = allEvaluatedResult;
      await project.save();

      console.log("🚀 ~ project after save ~ obj:", obj);
      console.log(
        "**********************PROJECT AFTER SAVE**********************"
      );
    }
    let studentSavePromises;
    if (obj.isGraded) {
      console.log("*********obj isGraded true entry section*****");
      const projectJudgement = projectEvaluation.judgement;

      console.log("************judgement before comparison***********");
      console.log(projectJudgement);
      if (
        projectJudgement === proposalJudgementConfig.ACCEPTED ||
        projectJudgement ===
          proposalJudgementConfig["ACCEPTED-CONDITIONALLY"] ||
        projectJudgement === midJudgementConfig["PROGRESS-SATISFACTORY"] ||
        projectJudgement === midJudgementConfig["PROGRESS-SEEN"] ||
        projectJudgement === midJudgementConfig["PROGRESS-NOT-SATISFACTORY"] ||
        projectJudgement === finalJudgementConfig.ACCEPTED ||
        projectJudgement === finalJudgementConfig["ACCEPTED-CONDITIONALLY"]
      ) {
        console.log("************judgement pass section***********");
        console.log(projectJudgement);
        project[evaluationType].hasGraduated = true;

        if (project[evaluationType].hasGraduated) {
          const studentSavePromises = project.teamMembers.map(
            async (studentId) => {
              const student = await Student.findOne({ _id: studentId });
              const eventType = initializeEventTypeBasedOnBatch(
                student.batchNumber
              );
              console.log(
                "*********student forward update progress section***********"
              );
              switch (eventType) {
                case "0":
                  student.progressStatus = updateProjectFirstProgressStatus(
                    progressStatusEligibilityCode[evaluationType].defensePass
                  );
                  if (evaluationType === defenseTypeCode.final) {
                    student.isAssociated = false;
                    student.project = undefined;
                    project.status = eventStatusList.complete;
                  }
                  break;
                case "1":
                  student.progressStatus = updateMinorProgressStatus(
                    progressStatusEligibilityCode[evaluationType].defensePass
                  );
                  if (evaluationType === defenseTypeCode.final) {
                    student.isAssociated = false;
                    student.project = undefined;
                    project.status = eventStatusList.complete;
                  }
                  break;
                case "2":
                  student.progressStatus = updateMajorProgressStatus(
                    progressStatusEligibilityCode[evaluationType].defensePass
                  );
                  if (evaluationType === defenseTypeCode.final) {
                    student.isAssociated = false;
                    student.project = undefined;
                    project.status = eventStatusList.complete;
                  }
                  break;
                default:
                  break;
              }
              return student.save();
            }
          );
          await Promise.all(studentSavePromises);
        }
      } else {
        const studentSavePromises = project.teamMembers.map(
          async (studentId) => {
            console.log("🚀 ~  before studentId:", studentId);
            const student = await Student.findOne({ _id: studentId });
            const eventType = initializeEventTypeBasedOnBatch(
              student.batchNumber
            );
            console.log(
              "*********student backward update progress section***********"
            );

            //judgement is
            if (
              projectJudgement === proposalJudgementConfig["RE-DEFENSE"] ||
              projectJudgement === finalJudgementConfig["RE-DEFENSE"] ||
              projectJudgement === proposalJudgementConfig.ABSENT ||
              projectJudgement === midJudgementConfig.ABSENT ||
              projectJudgement === finalJudgementConfig.ABSENT
            ) {
              console.log("🚀 ~ projectJudgement:", projectJudgement);
              console.log(
                "************judgement redefense defense fail  section***********"
              );

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
              console.log("🚀 ~ after absent studentId:", studentId);
            } else if (projectJudgement === proposalJudgementConfig.REJECTED) {
              console.log("************judgement rejected section***********");
              console.log(projectJudgement);
              switch (eventType) {
                case "0":
                  student.isAssociated = false;
                  student.progressStatus = updateProjectFirstProgressStatus(
                    progressStatusEligibilityCode[evaluationType].rejected
                  );
                  student.project = undefined;
                  project.status = eventStatusList.archive;
                  break;
                case "1":
                  student.isAssociated = false;
                  student.progressStatus = updateMinorProgressStatus(
                    progressStatusEligibilityCode[evaluationType].rejected
                  );
                  student.project = undefined;
                  project.status = eventStatusList.archive;
                  break;
                case "2":
                  student.isAssociated = false;
                  student.progressStatus = updateMajorProgressStatus(
                    progressStatusEligibilityCode[evaluationType].rejected
                  );
                  student.project = undefined;
                  project.status = eventStatusList.archive;
                  break;
                default:
                  break;
              }
              return student.save();
            }
          }
        );
        await Promise.all(studentSavePromises);
        if (
          obj.isGraded &&
          (projectJudgement === proposalJudgementConfig["RE-DEFENSE"] ||
            projectJudgement === proposalJudgementConfig.REJECTED ||
            projectJudgement === finalJudgementConfig["RE-DEFENSE"] ||
            projectJudgement === proposalJudgementConfig.ABSENT ||
            projectJudgement === midJudgementConfig.ABSENT ||
            projectJudgement === finalJudgementConfig.ABSENT)
        ) {
          console.log(
            "🚀 ~ submitEvaluation ~before  project[evaluationType].report :",
            project[evaluationType].report
          );
          project[evaluationType].report = undefined;
          console.log(
            "🚀 ~ submitEvaluation ~after  project[evaluationType].report :",
            project[evaluationType].report
          );
        }
      }
    }

    //removal of access code

    //fetch alll projects at once
    const projects = await Project.find({ _id: { $in: room.projects } });
    console.log("🚀 ~ submitEvaluation before ~ projects:", projects);
    const allProjectEvaluated = determineAllProjectsEvaluatedByEvaluator({
      res: res,
      projects,
      evaluationType,
      defenseId,
      evaluatorId,
    });
    console.log(
      "🚀 ~ submitEvaluation over main controller function ~ allProjectsEvaluated:",
      allProjectEvaluated
    );

    //if allproject evaluated then clear access code
    let evaluator;
    if (allProjectEvaluated) {
      evaluator = await Evaluator.findOne({
        _id: evaluatorId,
      });
      console.log("🚀 ~ submitEvaluation ~ inside evaluator:", evaluator);

      const defenseObj = evaluator.defense.find((defense) => {
        return defense.defenseId.toString() === defenseId;
      });
      console.log("🚀 ~ defenseObj ~ defenseObj:", defenseObj);

      defenseObj.accessCode = undefined;
      console.log("🚀 ~ submitEvaluation ~ outside evaluator:", evaluator);
      await evaluator.save();
    }
    //finally save the evaluation
    let formattedIndividualEvaluations;
    let newEvaluation;

    switch (evaluationType) {
      case "proposal":
        formattedIndividualEvaluations = individualEvaluation.map(
          (evaluation) => ({
            student: evaluation.member,
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

        newEvaluation = await Evaluation.create({
          individualEvaluation: formattedIndividualEvaluations,
          projectEvaluation: projectEvaluation,
          project: projectId,
          evaluator: evaluatorId,
          defense: defenseId,
          event: eventId,
          evaluationType: evaluationType,
        });

        if (!newEvaluation) return res.sendStatus(400);
        // if (!newEvaluation) return { statusCode: 400 };
        break;
      case "mid":
        console.log("MidEvaluation Section");
        formattedIndividualEvaluations = individualEvaluation.map(
          (evaluation) => ({
            student: evaluation.member,
            performanceAtPresentation: evaluation.performanceAtPresentation,
            absent: evaluation.absent,
            feedbackIncorporated: evaluation.absent
              ? "0"
              : projectEvaluation.feedbackIncorporated,
            workProgress: evaluation.absent
              ? "0"
              : projectEvaluation.workProgress,
            documentation: evaluation.absent
              ? "0"
              : projectEvaluation.documentation,
          })
        );
        console.log("MidEvaluation Section");
        newEvaluation = await Evaluation.create({
          individualEvaluation: formattedIndividualEvaluations,
          projectEvaluation: projectEvaluation,
          project: projectId,
          evaluator: evaluatorId,
          defense: defenseId,
          event: eventId,
          evaluationType: evaluationType,
        });
        console.log("MidEvaluation Section");
        if (!newEvaluation) return res.sendStatus(400);
        // if (!newEvaluation) return { statusCode: 400 };
        console.log("MidEvaluation Section");
        break;
      case "final":
        console.log("FinalEvaluation Section");
        formattedIndividualEvaluations = individualEvaluation.map(
          (evaluation) => ({
            student: evaluation.member,
            performanceAtPresentation: evaluation.performanceAtPresentation,
            absent: evaluation.absent,
            contributionInWork: evaluation.absent
              ? "0"
              : evaluation.contributionInWork,
            projectTitle: evaluation.absent
              ? "0"
              : projectEvaluation.projectTitle,
            volume: evaluation.absent ? "0" : projectEvaluation.volume,
            objective: evaluation.absent ? "0" : projectEvaluation.objective,
            creativity: evaluation.absent ? "0" : projectEvaluation.creativity,
            analysisAndDesign: evaluation.absent
              ? "0"
              : projectEvaluation.analysisAndDesign,
            toolAndTechniques: evaluation.absent
              ? "0"
              : projectEvaluation.toolAndTechniques,
            documentation: evaluation.absent
              ? "0"
              : projectEvaluation.documentation,
            accomplished: evaluation.absent
              ? "0"
              : projectEvaluation.accomplished,
            demo: evaluation.absent ? "0" : projectEvaluation.demo,
          })
        );

        newEvaluation = await Evaluation.create({
          individualEvaluation: formattedIndividualEvaluations,
          projectEvaluation: projectEvaluation,
          project: projectId,
          evaluator: evaluatorId,
          defense: defenseId,
          event: eventId,
          evaluationType: evaluationType,
        });
        if (!newEvaluation) return res.sendStatus(400);
        // if (!newEvaluation) return { statusCode: 400 };
        break;
      default:
        return res.sendStaus(400);
      // return { statusCode: 400 };
    }

    if (!newEvaluation) return res.sendStatus(400);
    // if (!newEvaluation) return { statusCode: 400 };

    defense.evaluations.push(newEvaluation._id);
    projectSubEvent.evaluations.push(newEvaluation._id);

    //update the documenta here
    await defense.save();
    await project.save();
    return res.status(201).json({
      data: newEvaluation,
    });
    // return { statusCode: 201 };
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return { statusCode: 400 };
  }
};

// Function to handle submission of evaluations
// const submitEvaluationThroughQueue = async (req, res) => {
//   try {
//     console.log("🚀 ~ submitEvaluationThroughQueue ~ evaluatorQueue:");
//     console.log("🚀 ~ redis token  ~ redis host:", REDIS_URI);
//     console.log("🚀 ~ redis token  ~ redis port:", REDIS_PORT);
//     console.log("🚀 ~ redis token  ~ redis password:", REDIS_TOKEN);

//     // Add the evaluation task to the queue
//     // Add the evaluation task to the queue
//     const job = await evaluatorQueue.add(
//       {
//         userId: req.userId,
//         evaluationData: req.body,
//       },
//       { delay: 2000, attempts: 1 }
//     );
//     // Wait for the job to complete and get the result
//     job
//       .finished()
//       .then((statusCode) => {
//         console.log(
//           "🚀 ~ submitEvaluationThroughQueue ~ statusCode:",
//           statusCode
//         );
//         return res.status(statusCode).json({
//           message: "Created Successfully",
//         });
//       })
//       .catch((err) => {
//         console.error(`Job failed: ${err.message}`);
//         return res.sendStatus(500);
//       });
//   } catch (err) {
//     console.error(`Error message: ${err.message}`);
//     res.sendStatus(400);
//   }
// };
module.exports = {
  getDefenseBydId,
  getProjectBydId,
  submitEvaluation,
};
