const initializeProgressStatus = (batchNumber) => {
  const date = new Date();
  const year = date.getFullYear();
  const currentAcademicYear = year - batchNumber - 1;
  switch (currentAcademicYear) {
    case 4:
      return "2000";
    case 3:
      return "1000";
    case 2:
      return "0000";
    default:
      return '----';
  }
};

module.exports = { initializeProgressStatus };
