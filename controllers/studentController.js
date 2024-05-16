const Student = require("../models/Students");
const Event = require("../models/Events");
const {
  filterSensitiveFields,
} = require("./utility functions/filterSensitiveDetails");
const updateStudent = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    const student = await Student.findOne({ _id: req.params.id }).exec();
    if (!student) {
      return res
        .status(204)
        .json({ message: `No employee matches ID ${req.params.id}.` });
    }
    if (req.body?.fullname) student.fullname = req.body.fullname;
    if (req.body?.phoneNumber) student.phoneNumber = req.body.phoneNumber;
    if (req.body?.program) student.program = req.body.program;
    const result = await student.save();
    result.refreshToken = undefined;
    result.role = undefined;
    result.password = undefined;
    res.json(result);
  } catch (err) {
    console.error(`error-message:${err.message}`);
    res.sendStatus(400);
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });

    //if events is empty then 204: no content
    if (!events) return res.sendStatus(204);
    const sensitiveFields = ["projects"];

    const filteredEventsDetails = events.map((event) => {
      const filteredEvent = filterSensitiveFields(event._doc, sensitiveFields);
      if(!filteredEvent) return res.status(400);
      return filteredEvent;
    });
    res.status(200).json({
      data: filteredEventsDetails,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

module.exports = { updateStudent, getAllEvents };
