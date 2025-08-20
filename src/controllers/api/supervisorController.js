const eventStatusList = require("../../config/constants/eventStatusList");
const Project = require("../../models/academic/Project");
const Supervisor = require("../../models/user/Supervisor");
const Event = require("../../models/academic/Event");
const ProgressLog = require("../../models/system/ProgressLog");
const { AppError } = require("../../middleware/errorHandler");
const transactionService = require("../../services/database/transactionService");
const progressStatusEligibilityCode = require("../../config/constants/progressStatusEligibilityCode");
const {
  updateMinorProgressStatus,
} = require("../helpers/project/updateMinorProgressStatus");
const {
  updateMajorProgressStatus,
} = require("../helpers/project/updateMajorProgressStatus");

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

const progressLogApprovalGrant = async (req, res, next) => {
  try {
    if (!req?.params?.id) {
      return next(new AppError('Project ID is required', 400));
    }

    const projectId = req.params.id;
    const { defenseType, approvedDate } = req.body;

    if (!defenseType || !approvedDate) {
      return next(new AppError('Defense type and approved date are required', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      // Find project with populated data
      const project = await Project.findById(projectId)
        .populate([
          { path: "teamMembers", select: "-OTP -password -refreshToken" },
          { path: "progressLogs" },
        ])
        .session(session);

      if (!project) {
        throw new AppError('Project not found', 404);
      }

      // Verify supervisor is assigned to this project
      if (project.supervisor?.supervisorId?.toString() !== req.userId) {
        throw new AppError('You are not the supervisor of this project', 403);
      }

      // Check if all progress logs are verified
      const isProgressLogHasBeenVerified = project.progressLogs.every(
        (progressLog) => progressLog.approved === true
      );

      if (!isProgressLogHasBeenVerified) {
        throw new AppError('All progress logs must be verified before approval', 409);
      }

      // Update supervisor approval
      if (!project.supervisor[defenseType]) {
        project.supervisor[defenseType] = {};
      }
      project.supervisor[defenseType].approved = true;
      project.supervisor[defenseType].approvedDate = approvedDate;

      // Update team members' progress status using bulkWrite
      const bulkOperations = project.teamMembers.map(student => {
        const evaluationType = defenseType;
        let newProgressStatus;

        switch (project.projectType) {
          case "1":
            newProgressStatus = updateMinorProgressStatus(
              progressStatusEligibilityCode[evaluationType].approvalFromSupervisor
            );
            break;
          case "2":
            newProgressStatus = updateMajorProgressStatus(
              progressStatusEligibilityCode[evaluationType].approvalFromSupervisor
            );
            break;
          default:
            throw new AppError('Invalid project type', 400);
        }

        return {
          updateOne: {
            filter: { _id: student._id },
            update: { progressStatus: newProgressStatus }
          }
        };
      });

      // Execute bulk update with session
      if (bulkOperations.length > 0) {
        await Project.findById(project._id).session(session);
        await Student.bulkWrite(bulkOperations, { session });
      }

      // Save project changes
      await project.save({ session });

      return project;
    });

    res.status(200).json({
      status: 'success',
      message: 'Progress approval granted successfully',
      data: {
        project: result
      }
    });

  } catch (error) {
    next(error);
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
