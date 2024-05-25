const getBatchYearFromEventType = (eventType) => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const yearDifference =
    eventType.toString() === "0"
      ? 3
      : eventType.toString() === "1"
      ? 4
      : eventType.toString() === "2"
      ? 5
      : null;

  //if invalid year difference due to event type
  if (!yearDifference) {
    console.error(`Error due to ${yearDifference} year difference`);
    return null;
  }
  // Calculate the batch year based on the event type
  const batchYear = currentYear - yearDifference;
  return batchYear;
};

module.exports = { getBatchYearFromEventType };
