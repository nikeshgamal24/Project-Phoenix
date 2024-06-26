const Student = require("../models/Student");
const Supervisor = require("../models/Supervisor");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const roleList = require("../config/roleList");
const {
  extractRollAndBatch,
} = require("./utility functions/extractRollAndBatch");
const {
  initializeProgressStatus,
} = require("./utility functions/initializeProgressStatus");

const handleNewUser = async (req, res) => {
  const { fullname, email, photo, password, phoneNumber, program, role } =
    req.body;
  console.log("🚀 ~ handleNewUser ~ req.body:", req.body);

  // checkCredentials(req,res,{ fullname, email, photo, password, phoneNumber, program });
  if (!fullname || !email || !password || !phoneNumber || !role)
    return res.status(400).json({
      message: "All credentials are required",
    });

  //checking for duplicate username || email
  let duplicate;
  if (role === roleList.Student) {
    duplicate = await Student.findOne({ email: email }).exec();
  } else if (role === roleList.Supervisor) {
    duplicate = await Supervisor.findOne({ email: email }).exec();
  } else if (role === roleList.Admin) {
    duplicate = await Admin.findOne({ email: email }).exec();
  } else {
    return res.sendStatus(400);
  }
  console.log("🚀 ~ handleNewUser ~ duplicate:", duplicate);

  // status 409--> for conflict status
  if (duplicate)
    return res.status(409).json({
      message: "Duplicate Credentials.",
    }); //conflicting status

  try {
    //encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //creating and save to the database
    let result;
    if (role === roleList.Student) {
      //extract roll number and batch number from the email address of the student
      const { rollNo, batchNo } = extractRollAndBatch(email);
      rollNumber = rollNo;
      batchNumber = batchNo;

      //determine the progress status of the student on their project based on the year of their academic and setting the progress status to database
      const progressStatus = initializeProgressStatus(batchNumber);

      //create a new student and save to the database
      result = await Student.create({
        fullname: fullname,
        email: email,
        password: hashedPassword,
        phoneNumber: phoneNumber,
        program: program,
        role: [role],
        rollNumber,
        batchNumber,
        progressStatus,
        isAssociated: false,
      });
    } else if (role === roleList.Supervisor) {
      result = await Supervisor.create({
        fullname: fullname,
        email: email,
        password: hashedPassword,
        phoneNumber: phoneNumber,
        role: [role],
      });
    } else if (role === roleList.Admin) {
      result = await Admin.create({
        fullname: fullname,
        email: email,
        password: hashedPassword,
        phoneNumber: phoneNumber,
        role: [role],
      });
    } else {
      return res.sendStatus(400);
    }

    //201--> successfully created
    res.status(201).json({
      message: `New User ${fullname} has been created!`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = { handleNewUser };
