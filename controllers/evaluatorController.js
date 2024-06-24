const Defense = require("../models/Defense");
const Project = require("../models/Project");
const Student = require("../models/Student");
const Evaluator = require("../models/Evaluator");
const Room = require("../models/Room");
const Evaluation = require("../models/Evaluation");
const {
  determineDefenseType,
} = require("./utility functions/determineDefenseType");
const { ObjectId } = require("mongodb");
const midJudgementConfig = require("../config/midJudgementConfig");
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
const eventStatusList = require("../config/eventStatusList");
const proposalJudgementConfig = require("../config/proposalJudgementConfig");
const defenseTypeCode = require("../config/defenseTypeCodeList");
const { finalJudgementConfig } = require("../config/finalJudgementConfig");

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
      console.log("🚀 ~ getDefenseBydId ~ projects:", projects);

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
            console.log("🚀 ~ getDefenseBydId ~ defenseObj:", defenseObj);
            return defenseObj.isGraded;
          })
        ) {
          isGradedStatus = false;
          break;
        }
      }

      console.log("🚀 ~ getDefenseBydId ~ isGradedStatus:", isGradedStatus);
      // If all projects in the room are graded, mark the room as completed
      if (isGradedStatus) {
        room.isCompleted = true;
        console.log("🚀 ~ getDefenseBydId ~ room:", room);

        // Remove access codes from evaluators
        await Evaluator.updateMany(
          { _id: { $in: room.evaluators }, "defense.defenseId": defense._id },
          { $unset: { "defense.$.accessCode": "" } }
        );
      } else {
        allRoomsCompleted = false;
      }

      // Save the updated room
      await room.save();
      console.log("🚀 ~ getDefenseBydId ~ room:", room);
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

    console.log(req.body);

    const project = await Project.findOne({ _id: projectId });
    const defense = await Defense.findOne({ _id: defenseId });

    if (!project) return res.sendStatus(404);
    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);

    // const endOfDay = new Date();
    // endOfDay.setHours(23, 59, 59, 999);
    // const latestIndexNumber = project[evaluationType].defenses.length - 1;
    // const latestDefenseId =
    //   project[evaluationType].defenses[latestIndexNumber].defense;
    // console.log(latestDefenseId);
    // const latestDefense =  project[evaluationType].defenses.find(obj=>obj.defense.toString() === defenseId);
    // console.log("🚀 ~ submitEvaluation ~ latestDefense:", latestDefense)

    // if(!latestDefense) return res.sendStatus(404); // defense not found

    const matchingEvaluation = await Evaluation.find({
      _id: { $in: project[evaluationType].evaluations },
      project: projectId,
      defense:defenseId,
      // createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    console.log("🚀 ~ submitEvaluation ~ matchingEvaluation:", matchingEvaluation)


    const projectOfPhase = project[evaluationType];

    if (matchingEvaluation.length) {
      const conflictExists = matchingEvaluation.some((evaluation) => {
        if (
          projectEvaluation.judgement !== evaluation.projectEvaluation.judgement
        ) {
          return true;
        }

        for (let i = 0; i < individualEvaluation.length; i++) {
          if (
            individualEvaluation[i].absent !==
            evaluation.individualEvaluation[i].absent
          ) {
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
        break;
      default:
        return res.sendStaus(400);
    }

    projectOfPhase.evaluations.push(newEvaluation._id);
    const evaluatorIdObj = new ObjectId(evaluatorId);
    console.log(
      "🚀 ~ submitEvaluation ~ evaluatorIdObj:",
      typeof evaluatorIdObj
    );
    console.log("🚀 ~ submitEvaluation ~ evaluatorIdObj:", evaluatorIdObj);
    console.log(projectOfPhase.defenses[0].defense);

    //find the defense that matches with the defense Id that we have
    // Find the specific defense object where an evaluator matches evaluatorIdObj
    const obj = projectOfPhase.defenses.find((defense) =>
      defense.evaluators.some((evaluator) =>
        evaluator.evaluator.equals(evaluatorIdObj)
      )
    );
    console.log("🚀 ~ submitEvaluation ~ obj:", obj);

    if (!obj) {
      return res.status(404).json({ message: "Defense not found" });
    }

    if (!obj.isGraded) {
      let trueCount = 0;

      // for (const evaluatorObj of   .evaluators) {
      //   if (evaluatorIdObj.equals(evaluatorObj.evaluator)) {
      //     evaluatorObj.hasEvaluated = true;
      //   }
      //   if (evaluatorObj.hasEvaluated) {
      //     trueCount += 1;
      //   }
      // }
      // Update hasEvaluated for the evaluator
      obj.evaluators.forEach((evaluatorObj) => {
        console.log("🚀 ~ obj.evaluators.forEach ~ evaluatorObj.evaluator.toString() === evaluatorId:", evaluatorObj.evaluator.toString() === evaluatorId)
        if (evaluatorObj.evaluator.toString() === evaluatorId) {
          evaluatorObj.hasEvaluated = true;
        }
      });

      console.log("***********obj.isGraded Status*****************");
      console.log(obj.isGraded);
      // Check if all evaluators have evaluated using every()
      const allEvaluatedResult = obj.evaluators.every(
        (evaluatorObj) => evaluatorObj.hasEvaluated
      );
      console.log(
        "🚀 ~ submitEvaluation ~ allEvaluatedResult:",
        allEvaluatedResult
      );
      obj.isGraded = allEvaluatedResult;

      console.log("🚀 ~ submitEvaluation ~ obj.isGraded:", obj.isGraded);

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
          projectJudgement ===
            midJudgementConfig["PROGRESS-NOT-SATISFACTORY"] ||
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
                projectJudgement === finalJudgementConfig["RE-DEMO"] ||
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
              } else if (
                projectJudgement === proposalJudgementConfig.REJECTED
              ) {
                console.log(
                  "************judgement rejected section***********"
                );
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
          await Promise.all(studentSavePromises); // <- Missing line added here
          if (
            obj.isGraded &&
            (projectJudgement === proposalJudgementConfig["RE-DEFENSE"] ||
              projectJudgement === proposalJudgementConfig.REJECTED ||
              projectJudgement === finalJudgementConfig["RE-DEFENSE"] ||
              projectJudgement === proposalJudgementConfig.ABSENT ||
              projectJudgement === midJudgementConfig.ABSENT ||
              projectJudgement === finalJudgementConfig.ABSENT)
          ) {
            console.log("************report remove section***********");
            console.log(projectJudgement);
            project[evaluationType].report = undefined;
            console.log("******after report is removed*********");
            console.log(project[evaluationType].report);
          }
        }
      }
    }

    defense.evaluations.push(newEvaluation._id);

    await defense.save();
    await project.save();
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
