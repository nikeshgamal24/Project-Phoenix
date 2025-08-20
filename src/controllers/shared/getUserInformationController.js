const {
    getUserInfoFromAccessToken,
  } = require("../helpers/auth/getUserInfoFromAccessToken");
  const Student = require("../../models/user/Student");
  
  const getUserInformation = async (req, res) => {
    try {
      const { email, role } = getUserInfoFromAccessToken(req);
      //get the user by the userId of the user i.e. current student
      const currentStudent = await Student.findOne({
        email: email,
        role: { $in: [role] },
      }).select("-refreshToken -password -OTP");
  
      //if not found
      if (!currentStudent) return res.sendStatus(401); //unauthorized
  
      //return the user without sensitve details
      return res.status(200).json({
        user: currentStudent,
      });
    } catch (err) {
      console.error(`error-message:${err.message}`);
      return res.sendStatus(400);
    }
  };
  
  module.exports= {getUserInformation};