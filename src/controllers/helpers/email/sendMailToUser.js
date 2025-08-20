const nodemailer = require("nodemailer");
const sendMailToUser = ({
  defenseType,
  evaluatorEmail,
  accessCode,
  defenseDate,
  defenseTime,
  room,
  evaluatorName,
}) => {
  try {
    // Extract the time components from the time string
    const time = new Date(defenseTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = defenseDate.split("T")[0];

    // Send the reset token to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    const mailOptions = {
      from: {
        name: "Project Phoenix",
        address: "nikesh.191624@ncit.edu.np",
      },
      to: evaluatorEmail,
      subject: `Upcoming Defense Details: ${date} - ${time} `,
      text: `Dear ${evaluatorName},\n\nPlease find the details for the upcoming defense:\n\nDefense Type: ${defenseType}\nDefense Time: ${time}\nDefense Date: ${date}\nAccess Code: ${accessCode}\nRoom: ${room}\n\nRegards,\nProject Phoenix`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  } catch (err) {
    console.log(`error-message:${err.message}`);
    return null;
  }
};

module.exports = { sendMailToUser };
