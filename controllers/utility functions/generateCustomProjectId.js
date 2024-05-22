const Project = require("../../models/Projects");
const generateCustomProjectId = async (eventType) => {
  try {
    // Get the current year
    const year = new Date().getFullYear().toString().slice(-2);
    // Get last two digits of the year

    // Find the latest project in the database for the given event type
    const latestProject = await Project.findOne({
      projectCode: new RegExp(`^P${eventType}-`),
    }).sort({ _id: -1 });

    // Default serial number if no project exists
    let serialNumber = 1;
    if (latestProject) {
      // Extract the serial number from the latest project ID
      const latestSerialNumber = parseInt(
        latestProject.projectCode.split("-")[2],
        10
      );
      serialNumber = latestSerialNumber + 1; // Increment the serial number
    }

    // Generate a random uppercase character for the last two characters
    const randomChar1 = String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    );
    const randomChar2 = String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    );

    // Pad serial number with leading zeros to ensure it's two digits
    const paddedSerialNumber = String(serialNumber).padStart(2, "0");
    // Concatenate components to form the custom project ID
    return `P${eventType}-${year}-${paddedSerialNumber}${randomChar1}${randomChar2}`;
  } catch (error) {
    console.error("Error generating custom project ID:", error.message);
    throw error;
  }
};

module.exports = { generateCustomProjectId };
