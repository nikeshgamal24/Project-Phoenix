const updateProgressStatus = (student) => {
  try {
    console.log(student);
    const progressStatus = student.progressStatus;
    const updatedProgressStatus =Number(progressStatus) + 1;
    return updatedProgressStatus.toString();
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return null;
  }
};

module.exports = { updateProgressStatus };
