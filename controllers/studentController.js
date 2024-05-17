const Student = require("../models/Students");
const Event = require("../models/Events");
const jwt = require("jsonwebtoken");
const {
  filterSensitiveFields,
} = require("./utility functions/filterSensitiveDetails");
const {
  initializeEventTypeBasedOnBatch,
} = require("./utility functions/initializeEventTypeBasedOnBatch");

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

    if (!currectStudent)
      return res
        .status(404)
        .json({ message: "No Matched Student Details", data: [] });

    //check the status of the student program
    const { program, batchNumber } = currectStudent;
    const allowedEventType = initializeEventTypeBasedOnBatch(batchNumber);

    //based on the status and the program select the event that the student is eligible
    let studentCurrentEvent = await Event.findOne({
      eventType: allowedEventType,
      eventTarget: { $in: [program, "72354"] },
    }).populate("author");

    if (!studentCurrentEvent)
      return res.status(404).json({
        message: "No matched events found",
        data: [],
      });

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
module.exports = { updateStudent, getAllEvents, getMyEvent };
