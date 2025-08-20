const Project = require("../../../models/academic/Project");

const uploadProjectReport = async ({
  id,
  defenseType,
  secure_url,
  submittedBy,
  submittedOn,
}) => {
  try {
    const updateFieldPath = `${defenseType}.report.filePath`;
    const updateFieldSubmittedBy = `${defenseType}.report.submittedBy`;
    const updateFieldSubmittedOn = `${defenseType}.report.submittedOn`;

    //save to the project db on the specified defense type report
    // Find the project by id and update the specific field
    const result = await Project.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          [updateFieldPath]: secure_url,
          [updateFieldSubmittedBy]: submittedBy,
          [updateFieldSubmittedOn]: submittedOn,
        },
      },
      { new: true } // To return the updated document
    );
    return result;
  } catch (err) {
    console.error(`"error-message:${err.message}"`);
    return null;
  }
};
module.exports = { uploadProjectReport };
