const initializeProgressStatus = (batchNumber) => {
  const date = new Date();
  const year = date.getFullYear();
  const currentAcademicYear = year - batchNumber - 1;
  switch (currentAcademicYear) {
    case 4:
      return "20-0.0";
    case 3:
      return "10-0.0";
    default:
      return "00-0.0";
  }
};

module.exports = { initializeProgressStatus };
