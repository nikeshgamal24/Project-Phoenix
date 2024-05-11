const Student = require("../models/Students");
const Teacher = require("../models/Teachers");
const Admin = require("../models/Admins");
const bcrypt = require("bcrypt");
const roleList = require("../config/roleList");

const handleNewUser = async (req, res) => {
  const { fullname, email, photo, password, phoneNumber, program, role } =
    req.body;

  // checkCredentials(req,res,{ fullname, email, photo, password, phoneNumber, program });
  if (!fullname || !email || !password || !phoneNumber)
    return res.status(400).json({
      message: "All credentials are required",
    });

  //checking for duplicate username || email
  let duplicate;
  if (role === roleList.Student) {
    duplicate = await Student.findOne({ email: email }).exec();
  } else if (role === roleList.Supervisor) {
    duplicate = await Teacher.findOne({ email: email }).exec();
  }else if (role === roleList.Admin) {
    duplicate = await Admin.findOne({ email: email }).exec();
  } else {
    return res.sendStatus(400);
  }

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
      result = await Student.create({
        fullname: fullname,
        email: email,
        password: hashedPassword,
        phoneNumber: phoneNumber,
        program: program,
        role: [role],
      });
    } else if (role === roleList.Supervisor) {
      result = await Teacher.create({
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
      data:result,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = { handleNewUser };
