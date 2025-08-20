const mongoose = require("mongoose");

const Student = require("../../models/user/Student");
const Event = require("../../models/academic/Event");
const Project = require("../../models/academic/Project");
const ProgressLog = require("../../models/system/ProgressLog");
const { AppError } = require("../../middleware/errorHandler");
const transactionService = require("../../services/database/transactionService");
const jwt = require("jsonwebtoken");
const {
  filterSensitiveFields,
} = require("../helpers/validation/filterSensitiveDetails");
const {
  initializeEventTypeBasedOnBatch,
} = require("../helpers/project/initializeEventTypeBasedOnBatch");
const {
  generateCustomProjectId,
} = require("../helpers/project/generateCustomProjectId");
const eventStatusList = require("../../config/constants/eventStatusList");
const {
  updateMajorProgressStatus,
} = require("../helpers/project/updateMajorProgressStatus");
const progressStatusEligibilityCode = require("../../config/constants/progressStatusEligibilityCode");
const { uploadFile } = require("../helpers/file/uploadFile");
const {
  uploadProjectReport,
} = require("../helpers/file/uploadProjectReport");
const {
  determineDefenseType,
} = require("../helpers/evaluation/determineDefenseType");
const {
  updateProjectFirstProgressStatus,
} = require("../helpers/project/updateProjectFirstProgressStatus");
const {
  updateMinorProgressStatus,
} = require("../helpers/project/updateMinorProgressStatus");
const {
  determineProposalDefenseType,
} = require("../helpers/evaluation/determineProposalDefenseType");
const {
  progressStatusValidityForEvent,
} = require("../../config/constants/progressStatusValidityForEvent");

//update student details
const updateStudent = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  const updateFields = {};
  const allowedFields = ["fullname", "phoneNumber", "program"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field]) {
      updateFields[field] = req.body[field];
    }
  });

  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        select: "-refreshToken -role -password",
      } // Exclude fields
    ).exec();

    if (!student) {
      return res
        .status(204)
        .json({ message: `No student matches ID ${req.params.id}.` });
    }

    res.json(student);
  } catch (err) {
    console.error(`error-message:${err.message}`);
    res.sendStatus(400);
  }
};

//get all events that are running
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .select("-projects");

    //if events is empty then 204: no content
    if (!events) return res.sendStatus(204);
    res.status(200).json({
      data: events,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

//get event that is targeted based on the student status and program
const getMyEvent = async (req, res) => {
  try {
    //get the user from the access token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //Unauthorized

    const accessToken = authHeader.split(" ")[1];

    const { UserInfo } = jwt.decode(accessToken);
    const { email, role } = UserInfo;

    const currectStudent = await Student.findOne({
      email: email,
      role: { $in: [role] },
    });

    if (!currectStudent) return res.sendStatus(401);

    //check the status of the student program
    const { program, batchNumber } = currectStudent;
    const allowedEventType = initializeEventTypeBasedOnBatch(batchNumber);

    //based on the status and the program select the event that the student is eligible
    const studentCurrentEvent = await Event.findOne({
      eventType: allowedEventType,
      eventTarget: { $in: [program, "72354"] },
      eventStatus: eventStatusList.active,
    }).populate("author");

    if (!studentCurrentEvent) return res.sendStatus(204);

    //filter student's progress status particular eventtype's status ko range ma para ki nai pardaiina 204

    console.log("🚀 ~ getMyEvent ~ allowedEventType:", allowedEventType);
    const withinRange = progressStatusValidityForEvent({
      allowedEventType: allowedEventType,
      studentProgressStatus: currectStudent.progressStatus,
    });

    console.log("🚀 ~ getMyEvent ~ withinRange:", withinRange);
    //if wihthinrange is false then return 204
    if (!withinRange) return res.sendStatus(204);
    
    //hide sensitive details of author
    const sensitiveDetails = ["role", "refreshToken", "password", "OTP"];
    studentCurrentEvent.author = filterSensitiveFields(
      studentCurrentEvent.author.toObject(),
      sensitiveDetails
    );

    //return event
    return res.status(200).json({
      data: studentCurrentEvent,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getAllStudentsList = async (req, res) => {
  try {
    //get the user from the access token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //Unauthorized

    const accessToken = authHeader.split(" ")[1];

    const { UserInfo } = jwt.decode(accessToken);
    const { email, role } = UserInfo;

    const currectStudent = await Student.findOne({
      email: email,
      role: { $in: [role] },
    });

    if (!currectStudent)
      return res
        .status(404)
        .json({ message: "No Matched Student Details", data: [] });

    //check the status of the student program
    const { progressStatus, program, batchNumber } = currectStudent;

    //list of all student of same batch ,program and with same status code
    const studentList = await Student.find({
      progressStatus: progressStatus,
      batchNumber: batchNumber,
      program: program,
      isAssociated: false,
    });

    //if no matched is found
    if (!studentList)
      return res
        .status(404)
        .json({ message: "No Matched Student Details", data: [] });

    //return student list if any
    return res.status(200).json({
      results: studentList.length,
      data: studentList,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(500);
  }
};

const createProjectTeam = async (req, res, next) => {
  try {
    const {
      projectName,
      projectDescription,
      teamMembers,
      eventId,
      categories,
    } = req.body;

    // Get current user details
    const currentUser = await Student.findById(req.userId);
    if (!currentUser) {
      return next(new AppError('User not found', 404));
    }

    const { batchNumber, program } = currentUser;

    // Validate team members in one query instead of N queries
    const students = await Student.find({
      _id: { $in: teamMembers }
    }).select('isAssociated _id');

    // Check if all requested students exist
    if (students.length !== teamMembers.length) {
      return next(new AppError('One or more team members not found', 400));
    }

    // Check if any student is already associated with a project
    const alreadyAssociated = students.some(student => student.isAssociated);
    if (alreadyAssociated) {
      return next(new AppError('One or more team members are already associated with a project', 409));
    }

    // Create custom project code
    const eventType = initializeEventTypeBasedOnBatch(batchNumber);
    const projectCode = await generateCustomProjectId({
      eventType: eventType,
      program: program,
    });

    if (!projectCode) {
      return next(new AppError('Failed to generate project code', 500));
    }

    // Determine new progress status based on event type
    let newProgressStatus;
    switch (eventType) {
      case "0":
        newProgressStatus = updateProjectFirstProgressStatus(
          progressStatusEligibilityCode.proposal.eligibeForReportSubmission
        );
        break;
      case "1":
        newProgressStatus = updateMinorProgressStatus(
          progressStatusEligibilityCode.proposal.eligibeForReportSubmission
        );
        break;
      case "2":
        newProgressStatus = updateMajorProgressStatus(
          progressStatusEligibilityCode.proposal.eligibeForReportSubmission
        );
        break;
      default:
        return next(new AppError('Invalid event type', 400));
    }

    if (!newProgressStatus) {
      return next(new AppError('Failed to determine progress status', 500));
    }

    // Start a transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create the project
      const newProject = await Project.create([{
        projectCode,
        projectName,
        projectType: eventType,
        projectDescription,
        teamMembers,
        event: eventId,
        status: eventStatusList.active,
        categories,
      }], { session });

      if (!newProject || newProject.length === 0) {
        throw new Error('Failed to create project');
      }

      const projectId = newProject[0]._id;

      // Update all team members in one operation using bulkWrite
      const bulkOperations = teamMembers.map(memberId => ({
        updateOne: {
          filter: { _id: memberId },
          update: {
            $set: {
              project: projectId,
              isAssociated: true,
              progressStatus: newProgressStatus
            }
          }
        }
      }));

      await Student.bulkWrite(bulkOperations, { session });

      // Update event to include the new project
      await Event.findByIdAndUpdate(
        eventId,
        { $push: { projects: projectId } },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

      // Populate and return the created project
      const populatedProject = await Project.findById(projectId)
        .populate('teamMembers', '-password -refreshToken -OTP')
        .session(null); // Remove session for this query

      // Send success response
      res.status(201).json({
        status: 'success',
        message: 'Project team created successfully',
        data: {
          project: populatedProject
        }
      });

    } catch (error) {
      // Rollback the transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }

  } catch (error) {
    next(error);
  }
};

//get project by id
const getProjectById = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  try {
    const populateOptions = [
      { path: "teamMembers" },
      { path: "progressLogs", populate: { path: "author" } },
      { path: "supervisor", populate: { path: "supervisorId" } },
      { path: "event" },
      {
        path: "proposal",
        populate: [
          { path: "evaluations", populate: { path: "evaluator" } },
          { path: "defenses.evaluators.evaluator" },
          { path: "defenses.defense", populate: { path: "rooms" } },
        ],
      },
      {
        path: "mid",
        populate: [
          { path: "evaluations", populate: { path: "evaluator" } },
          { path: "defenses.evaluators.evaluator" },
          { path: "defenses.defense", populate: { path: "rooms" } },
        ],
      },
      {
        path: "final",
        populate: [
          { path: "evaluations", populate: { path: "evaluator" } },
          { path: "defenses.evaluators.evaluator" },
          { path: "defenses.defense", populate: { path: "rooms" } },
        ],
      },
    ];

    const project = await Project.findById(req.params.id).populate(
      populateOptions
    );

    if (!project) {
      return res
        .status(204)
        .json({ message: `No Project matches with id: ${req.params.id}.` });
    }

    const sensitiveDetails = ["password", "OTP", "refreshToken"];
    let defenseType;
    const filteredStudentsDetails = project.teamMembers.map((student) => {
      defenseType = determineDefenseType(student.progressStatus);
      const filteredStudent = filterSensitiveFields(
        student.toObject(),
        sensitiveDetails
      );
      return filteredStudent;
    });

    // Check if defenseType is valid
    if (!defenseType) {
      return res
        .status(400)
        .json({ message: "Defense type could not be determined." });
    }

    // Populate defenses.defense within project[defenseType].defenses
    for (let i = 0; i < project[defenseType].defenses.length; i++) {
      await project.populate({
        path: `${defenseType}.defenses.${i}.defense`,
        populate: { path: "rooms" },
        options: { strictPopulate: false },
      });
    }
    await project.save();
    return res.status(200).json({
      data: { ...project.toObject(), teamMembers: filteredStudentsDetails },
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return res.sendStatus(500);
  }
};

const submitReport = async (req, res, next) => {
  try {
    if (!req?.params?.id) {
      return next(new AppError('Invalid Project Id', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      // Get project with team members
      const project = await Project.findById(req.params.id)
        .populate("teamMembers")
        .session(session);

      if (!project) {
        throw new AppError('Project not found', 404);
      }

      if (!project.teamMembers?.length) {
        throw new AppError('No team members found for project', 400);
      }

      // Determine event type and defense type
      const eventType = initializeEventTypeBasedOnBatch(
        project.teamMembers[0].batchNumber
      );

      let defenseType = null;
      switch (eventType) {
        case "0":
          defenseType = determineProposalDefenseType(
            project.teamMembers[0].progressStatus
          );
          break;
        case "1":
        case "2":
          defenseType = determineDefenseType(
            project.teamMembers[0].progressStatus
          );
          break;
        default:
          throw new AppError('Invalid event type', 400);
      }

      if (defenseType === "unknown") {
        throw new AppError('Invalid progress status for submission', 409);
      }

      // Upload file to cloudinary
      const upload = await uploadFile(req.file.path);
      if (!upload?.secure_url) {
        throw new AppError('File upload failed', 500);
      }

      // Update project with report details
      const projectUpdate = await uploadProjectReport({
        id: req.params.id,
        defenseType: defenseType,
        secure_url: upload.secure_url,
        submittedBy: req.body.submittedBy,
        submittedOn: req.body.submittedOn,
      });

      if (!projectUpdate) {
        throw new AppError('Failed to update project with report', 500);
      }

      // Update all team members' progress status using bulkWrite
      const bulkOperations = project.teamMembers.map(student => {
        let newProgressStatus;
        switch (eventType) {
          case "0":
            newProgressStatus = updateProjectFirstProgressStatus(
              progressStatusEligibilityCode[defenseType].eligibleForDefense
            );
            break;
          case "1":
            newProgressStatus = updateMinorProgressStatus(
              progressStatusEligibilityCode[defenseType].eligibleForDefense
            );
            break;
          case "2":
            newProgressStatus = updateMajorProgressStatus(
              progressStatusEligibilityCode[defenseType].eligibleForDefense
            );
            break;
        }

        return {
          updateOne: {
            filter: { _id: student._id },
            update: { progressStatus: newProgressStatus }
          }
        };
      });

      // Execute bulk update with session
      await Student.bulkWrite(bulkOperations, { session });

      return projectUpdate;
    });

    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Report submitted and team status updated successfully',
      data: {
        project: result
      }
    });

  } catch (error) {
    next(error);
  }
};

const getAllArchiveProjects = async (req, res) => {
  const studentId = req.userId;
  console.log(studentId);
  console.log(req.params.studentId);
  if (!studentId) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  try {
    const associatedProjects = await Project.find({
      teamMembers: {
        $in: [studentId],
      },
      status: {
        $in: [eventStatusList.complete, eventStatusList.archive],
      },
    }).sort({ createdAt: -1 });

    if (!associatedProjects || associatedProjects.length === 0) {
      return res.sendStatus(204); // No Content
    }

    return res.status(200).json({
      data: associatedProjects,
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return res.sendStatus(500);
  }
};

const createProgressLog = async (req, res, next) => {
  try {
    const { title, description, logDate, projectId } = req.body;

    if (!title || !description || !logDate || !projectId) {
      return next(new AppError('Missing required fields', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      // Validate project exists and user is a team member
      const project = await Project.findOne({
        _id: projectId,
        teamMembers: { $in: [req.userId] },
        status: eventStatusList.active,
      }).session(session);

      if (!project) {
        throw new AppError('Project not found or you are not a team member', 404);
      }

      // Create progress log
      const newProgressLog = await ProgressLog.create([{
        title,
        description,
        logDate,
        author: req.userId,
        projectId: projectId,
      }], { session });

      if (!newProgressLog || newProgressLog.length === 0) {
        throw new AppError('Failed to create progress log', 500);
      }

      // Add progress log to project
      await Project.findByIdAndUpdate(
        projectId,
        { $push: { progressLogs: newProgressLog[0]._id } },
        { session }
      );

      return newProgressLog[0];
    });

    res.status(201).json({
      status: 'success',
      message: 'Progress log created successfully',
      data: {
        progressLog: result
      }
    });

  } catch (error) {
    next(error);
  }
};

const getAllProjectLogsOfProject = async (req, res) => {
  try {
    //get the project id from the params
    const projectId = req.params.id;
    console.log("🚀 ~ getAllProjectLogsOfProject ~ projectId:", projectId);

    //if projectId is not found
    if (!projectId) return res.sendStatus(400);

    const progressLogs = await ProgressLog.find({
      projectId: projectId,
    }).populate([{ path: "author" }, { path: "projectId" }]);

    console.log(
      "🚀 ~ getAllProjectLogsOfProject ~ progressLogs:",
      progressLogs
    );

    //when there is no progress logs for the project
    if (!progressLogs || !progressLogs.length) return res.sendStatus(204);

    //return success
    return res.status(200).json({
      data: progressLogs,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.status(400);
  }
};
module.exports = {
  updateStudent,
  getAllEvents,
  getMyEvent,
  getAllStudentsList,
  createProjectTeam,
  getProjectById,
  submitReport,
  getAllArchiveProjects,
  createProgressLog,
  getAllProjectLogsOfProject,
};
