const Student = require("../models/Students");

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

module.exports = { updateStudent };
