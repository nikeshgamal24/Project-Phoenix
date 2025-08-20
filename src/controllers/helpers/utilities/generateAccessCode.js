
const generateAccesscode = ({ evaluatorEmail }) => {
  try {
    // Generate a random 6-digit number
    console.log("inside generate code function evaluatorEmail");
    console.log(evaluatorEmail);
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    return accessCode;
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return null;
  }
};

module.exports = { generateAccesscode };
