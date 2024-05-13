const Student = require("../models/Students");
const Teacher = require("../models/Teachers");
const Admin = require("../models/Admins");
const bcrypt = require("bcrypt");
const roleList = require("../config/roleList");
const { searchUser } = require("./verifyEmails/searchUser");

const handleNewUser = async (req, res) => {
  const { fullname, email, photo, password, phoneNumber, program, role } =
    req.body;

  if (!fullname || !email || !password || !phoneNumber)
    return res.status(400).json({
      message: "All credentials are required",
    });

  //checking for duplicate username || email
  let duplicate;
  switch (role) {
    case roleList.Student:
      duplicate =await searchUser(Student, email, role);
      break;
    case roleList.Admin:
      duplicate = await searchUser(Admin, email, role);
      break;
    case roleList.Supervisor:
      duplicate = await searchUser(Teacher, email, role);
      break;
    default:
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
    switch (role) {
      case roleList.Student:
        result = await Student.create({
          fullname: fullname,
          email: email,
          password: hashedPassword,
          phoneNumber: phoneNumber,
          program: program,
          role: [role],
        });
        break;
      case roleList.Admin:
        result = await Admin.create({
          fullname: fullname,
          email: email,
          password: hashedPassword,
          phoneNumber: phoneNumber,
          role: [role],
        });
        break;
      case roleList.Supervisor:
        result = await Teacher.create({
          fullname: fullname,
          email: email,
          password: hashedPassword,
          phoneNumber: phoneNumber,
          role: [role],
        });
        break;
      default:
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
