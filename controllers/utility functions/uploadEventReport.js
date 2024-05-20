const Project = require("../../models/Projects");

const uploadEventReport = async (id, defenseType, secure_url) => {
  try {
    const updateField = `${defenseType}.reportPdf`;
    //save to the project db on the specified defense type report
    // Find the project by id and update the specific field
    const result = await Project.findOneAndUpdate(
      { _id: id },
      { $set: { [updateField]: secure_url } },
      { new: true } // To return the updated document
    );
    return result;
  } catch (err) {
    console.error(`"error-message:${err.message}"`);
    return null;
  }
};
module.exports = { uploadEventReport };
