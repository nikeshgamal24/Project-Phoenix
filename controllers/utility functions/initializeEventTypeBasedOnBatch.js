const initializeEventTypeBasedOnBatch = (batchNumber) => {
    const date = new Date();
    const year = date.getFullYear();
    const currentAcademicYear = (year - batchNumber )- 1;
    switch (currentAcademicYear) {
      case 4:
        return "2";
      case 3:
        return "1";
      case 2:
        return "0";
      default:
        return '----';
    }
  };
  
  module.exports = { initializeEventTypeBasedOnBatch };
  