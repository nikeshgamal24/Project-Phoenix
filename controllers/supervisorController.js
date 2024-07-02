const eventStatusList = require("../config/eventStatusList");
const Project = require("../models/Project");
const Supervisor = require("../models/Supervisor");
const Event = require("../models/Event");
const ProgressLog = require("../models/ProgressLog");
const progressStatusEligibilityCode = require("../config/progressStatusEligibilityCode");
const {
  updateMinorProgressStatus,
} = require("./utility functions/updateMinorProgressStatus");
const {
  updateMajorProgressStatus,
} = require("./utility functions/updateMajorProgressStatus");

//update student details
const updateSupervisor = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.sendStatus(400);
    }

    const updateFields = {};
    const allowedFields = [
      "institution",
      "designation",
      "skillSet",
      "phoneNumber",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field]) {
        if (Array.isArray(req.body[field])) {
          updateFields[field] = req.body[field].map((fieldValue) => {
            return fieldValue;
          });
        }
        updateFields[field] = req.body[field];
      }
    });

    const supervisor = await Supervisor.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        select: "-refreshToken -password -OTP",
      } // Exclude fields
    ).exec();

    if (!supervisor) {
      return res
        .status(204)
        .json({ message: `No student matches ID ${req.params.id}.` });
    }

    return res.status(200).json({
      data: supervisor,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getAllActiveProjects = async (req, res) => {
  try {
    //get all projects where the supervisor id inside supervirsor object is equal to current logged in supervisor id where the project status is active
    const projects = await Project.find({
      "supervisor.supervisorId": req.userId,
      status: eventStatusList.active,
    });

    //when there is no content for the supervisor
    if (!projects.length) return res.sendStatus(204);

    return res.status(200).json({
      data: projects,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getAllArchiveProjects = async (req, res) => {
  try {
    //get all projects where the supervisor id inside supervirsor object is equal to current logged in supervisor id and is either complete or archive
    const projects = await Project.find({
      "supervisor.supervisorId": req.userId,
      status: {
        $in: [eventStatusList.complete, eventStatusList.archive],
      },
    }).populate({
      path: "supervisor.supervisorId",
      select: "-OTP -refreshToken -password",
    });

    //when there is no content for the supervisor
    if (!projects.length) return res.sendStatus(204);

    return res.status(200).json({
      data: projects,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getProjectById = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }
  try {
    // Find event by ID and populate the author field
    const project = await Project.findById({
      _id: req.params.id,
      status: eventStatusList.active,
    })
      .populate("teamMembers")
      .populate("event")
      .populate({
        path: "progressLogs",
        populate: {
          path: "author",
          select: "-OTP -refreshToken -password",
        },
      })
      .populate([
        { path: "proposal.evaluations", populate: { path: "evaluator" } },
        { path: "mid.evaluations", populate: { path: "evaluator" } },
        { path: "final.evaluations", populate: { path: "evaluator" } },
      ]);

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
    return res.sendStatus(400);
  }
};
const getAllActiveEvents = async (req, res) => {
  try {
    const events = await Event.find({
      eventStatus: eventStatusList.active,
    });

    if (!events.length) return res.sendStatus(204);

    return res.status(200).json({
      data: events,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const toogleAvailabilityOfSupervisor = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    console.log(
      "🚀 ~ toogleAvailabilityOfSupervisor ~ isAvailable:",
      isAvailable
    );

    //get the current sueprviso
    const updatedSupervisor = await Supervisor.findOneAndUpdate(
      { _id: req.userId },
      { $set: { isAvailable: isAvailable } },
      { new: true }
    );
    console.log(
      "🚀 ~ toogleAvailabilityOfSupervisor ~ updatedSupervisor:",
      updatedSupervisor
    );

    return res.status(200).json({
      data: updatedSupervisor,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const progressLogVerify = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    // id of the progresslog
    return res.sendStatus(400);
  }
  try {
    const { approvedDate } = req.body;
    console.log("🚀 ~ progressLogVerify ~ approvedDate:", approvedDate);
    // Find event by ID and populate the author field
    const progressLog = await ProgressLog.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          approved: true,
          approvedDate: approvedDate,
        },
      },
      { new: true } // This option returns the updated document
    );

    // Check if event exists
    if (!progressLog) {
      return res.sendStatus(204);
    }
    console.log("🚀 ~ progressLogVerify ~ progressLog:", progressLog);
    // Send response
    return res.status(200).json({
      data: progressLog,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const progressLogApprovalGrant = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    // id of the project inside project we have to check for the progresslog status
    return res.sendStatus(400);
  }
  try {
    const projectId = req.params.id;
    const { defenseType, approvedDate } = req.body;

    // Find event by ID and populate the author field
    const project = await Project.findOne({
      _id: projectId,
    }).populate([
      { path: "teamMembers", select: "-OTP -password -refreshToken" },
      { path: "progressLogs" },
    ]);

    //if there is no project of received parameter
    if (!project) {
      return res.sendStatus(204);
    }

    const isProgressLogHasBeenVerified = project.progressLogs.every(
      (progressLog) => progressLog.approved === true
    );

    if (!isProgressLogHasBeenVerified) {
      return res.sendStatus(409);
    }

    //update the supervisor object of the project: making it eligible for the defense
    project.supervisor[defenseType].approved = true;
    project.supervisor[defenseType].approvedDate = approvedDate;

    //update the status code of the student
    if (project.supervisor[defenseType].approved) {
      for (const student of project.teamMembers) {
        // console.log("🚀 ~ progressLogApprovalGrant ~ student:", student)
        const evaluationType = defenseType;
        switch (project.projectType) {
          case "1":
            console.log("update student progress of minor project");
            console.log(
              "🚀 ~ progressStatusEligibilityCode[evaluationType].eligibleForDefense ~ student:",
              progressStatusEligibilityCode[evaluationType]
                .approvalFromSupervisor
            );
            student.progressStatus = updateMinorProgressStatus(
              progressStatusEligibilityCode[evaluationType]
                .approvalFromSupervisor
            );
            console.log(
              "🚀 ~ progressLogApprovalGrant ~ student.progressStatus :",
              student.progressStatus
            );
            break;
          case "2":
            console.log("update student progress of major project");
            console.log(
              "🚀 ~ progressStatusEligibilityCode[evaluationType].eligibleForDefense ~ student:",
              progressStatusEligibilityCode[evaluationType]
                .approvalFromSupervisor
            );
            student.progressStatus = updateMajorProgressStatus(
              progressStatusEligibilityCode[evaluationType]
                .approvalFromSupervisor
            );
            console.log(
              "🚀 ~ progressLogApprovalGrant ~ student.progressStatus:",
              student.progressStatus
            );
            break;
        }
        await student.save();
      }
    }

    // Check if event exists
    await project.save();

    // Send response
    return res.status(200).json({
      data: project,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};
module.exports = {
  updateSupervisor,
  getAllActiveProjects,
  getAllArchiveProjects,
  getProjectById,
  getAllActiveEvents,
  toogleAvailabilityOfSupervisor,
  progressLogVerify,
  progressLogApprovalGrant,
};
