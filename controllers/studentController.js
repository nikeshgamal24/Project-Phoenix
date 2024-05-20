const Student = require("../models/Students");
const Event = require("../models/Events");
const Project = require("../models/Projects");
const jwt = require("jsonwebtoken");
const {
  filterSensitiveFields,
} = require("./utility functions/filterSensitiveDetails");
const {
  initializeEventTypeBasedOnBatch,
} = require("./utility functions/initializeEventTypeBasedOnBatch");
const {
  generateCustomProjectId,
} = require("./utility functions/generateCustomProjectId");
const eventStatusList = require("../config/eventStatusList");
const {
  updateMajorProgressStatus,
} = require("./utility functions/updateMajorProgressStatus");
const progressStatusEligibilityCode = require("../config/progressStatusEligibilityCode");
const { uploadFile } = require("./utility functions/uploadFile");
const { uploadEventReport } = require("./utility functions/uploadEventReport");
const {
  determineDefenseType,
} = require("./utility functions/determineDefenseType");

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
    let studentCurrentEvent = await Event.findOne({
      eventType: allowedEventType,
      eventTarget: { $in: [program, "72354"] },
      eventStatus: eventStatusList.active,
    }).populate("author");

    if (!studentCurrentEvent) return res.sendStatus(204);

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

const createProjectTeam = async (req, res) => {
  try {
    if (!req?.body?.projectName || !req?.body?.teamMembers) {
      return res.status(400).json({ message: "Required Fields are empty" });
    }

    //destructing the req.body to get the necessary values from the object
    const { projectName, projectDescription, teamMembers, eventId } = req.body;
    const { batchNumber } = await Student.findOne({
      _id: req.userId,
    });

    //first check whether the teamMembers selected are associated with other projects or not
    //1. check the isAssociated field and even one of the teamMember is already associated with other existing project then return with 409 conflicting status
    let alreadyAssociated = false;
    //will loop all the id and check whether there is isAssociated to true and if so not allowing further to proceed to create the project

    //returns the promise array
    const associationChecks = teamMembers.map(async (studentId) => {
      const currentStudent = await Student.findOne({ _id: studentId });
      return currentStudent.isAssociated;
    });

    //get the value of the promises and returns the array
    const results = await Promise.all(associationChecks);

    //checks whether the array includes true value or not and return Boolean value if true
    alreadyAssociated = results.includes(true);
    if (alreadyAssociated) return res.sendStatus(409);

    //create custom project code
    const eventType = initializeEventTypeBasedOnBatch(batchNumber);
    const projectCode = await generateCustomProjectId(eventType);

    const newProject = await Project.create({
      projectCode: projectCode,
      projectName: projectName,
      projectType:eventType,
      projectDescription: projectDescription,
      teamMembers: teamMembers,
      event: eventId,
      status: eventStatusList.active,
    });

    //unable to create team
    if (!newProject) return res.sendStatus(400);

    //save reference id to Student.projects and Event.projects
    teamMembers.forEach(async (id) => {
      const currentStudent = await Student.findOne({
        _id: id,
      });

      currentStudent.project = newProject._id;
      //update the student isAssociated field
      currentStudent.isAssociated = true;
      currentStudent.progressStatus = updateMajorProgressStatus(
        progressStatusEligibilityCode.proposal.eligibeForReportSubmission
      );
      if (!currentStudent.progressStatus) return res.sendStatus(400);
      await currentStudent.save();
    });
    //for saving projects in event collections

    const currentEvent = await Event.findOne({
      _id: eventId,
    });

    currentEvent.projects = [...currentEvent.projects, newProject._id];
    await currentEvent.save();

    const populatedDetails = await newProject.populate("teamMembers");

    const sensitiveDetails = ["password", "OTP", "refreshToken"];
    const filteredStudentsDetails = populatedDetails.teamMembers.map(
      (student) => {
        const filteredStudent = filterSensitiveFields(
          student.toObject(),
          sensitiveDetails
        );
        return filteredStudent;
      }
    );

    //if sucessfully created new project then return
    //will return newProject details with populated student details
    return res.status(200).json({
      data: {
        ...populatedDetails.toObject(),
        teamMembers: filteredStudentsDetails,
      },
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(500);
  }
};

//get project by id
const getProjectById = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  try {
    let project = await Project.findOne({
      _id: req.params.id,
    })
      .populate("teamMembers")
      .populate("event");

    if (!project) {
      return res
        .status(204)
        .json({ message: `No Project matches with id: ${req.params.id}.` });
    }

    const sensitiveDetails = ["password", "OTP", "refreshToken"];

    const filteredStudentsDetails = project.teamMembers.map((student) => {
      const filteredStudent = filterSensitiveFields(
        student.toObject(),
        sensitiveDetails
      );
      return filteredStudent;
    });

    return res.status(200).json({
      data: { ...project.toObject(), teamMembers: filteredStudentsDetails },
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    res.sendStatus(500);
  }
};

const submitReport = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({ message: "Invalid Project Id" });
    }
    //get the progressStatus Code from the db
    const { teamMembers } = await Project.findOne({
      _id: req.params.id,
    }).populate("teamMembers");

    //determine the defenseType
    const defenseType = determineDefenseType(teamMembers[0].progressStatus);

    //check defenseType for unknown
    if (defenseType === "unknown")
      return res.status(409).json({
        message: "Invalid progress status for submission",
      });

    //upload file to the cloudinary
    const upload = await uploadFile(req.file.path);

    //save the secure url to the projects' event type's filepath
    const result = await uploadEventReport(
      req.params.id,
      defenseType,
      upload.secure_url
    );

    //if null then send bad request as something went wrong fetching the project and updating the project fields
    if (!result) return res.sendStatus(400);

    //not null update the status
    //1. get the team memebers
    //2. use map and update the progress status of every stuent
    //according to the defense type and eligibility the progress status will be changes after submitting the report for the defense once uploading the report is successfull
    teamMembers.forEach(async (student) => {
      student.progressStatus = updateMajorProgressStatus(
        progressStatusEligibilityCode[defenseType].eligibleForDefense
      );
      await student.save();
    });

    //return record after saving the document
    return res.status(200).json({
      projectDetails: result,
    });
  } catch (err) {
    console.error(`"error-message":${err.message}`);
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
};
