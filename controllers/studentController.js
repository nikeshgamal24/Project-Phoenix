const Student = require("../models/Students");
const Event = require("../models/Events");
const {
  filterSensitiveFields,
} = require("./utility functions/filterSensitiveDetails");


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

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).select('-projects');

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

module.exports = { updateStudent, getAllEvents };
