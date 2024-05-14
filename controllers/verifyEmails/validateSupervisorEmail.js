const { validateStudentEmail } = require("./validateStudentEmail");
const validateSupervisorEmail = (supervisorEmail) => {
  const supervisorEmailRegex =
    /^[a-zA-Z]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.edu\.np$/;

  const studentEmailvalidationStatus = validateStudentEmail(supervisorEmail);
  const studenEmailValidationStatus =
    supervisorEmailRegex.test(supervisorEmail) && !studentEmailvalidationStatus;
  return studenEmailValidationStatus;
};

module.exports = { validateSupervisorEmail };
