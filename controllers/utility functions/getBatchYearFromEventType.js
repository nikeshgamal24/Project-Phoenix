const getBatchYearFromEventType = (eventType) => {
    const date = new Date();
    const currentYear = date.getFullYear();
    const yearDifference = (eventType==="0")?3:(eventType==="1")?4:5;
    // Calculate the batch year based on the event type
    const batchYear = currentYear - yearDifference;
    return batchYear;
  };
  
  module.exports = { getBatchYearFromEventType };
  