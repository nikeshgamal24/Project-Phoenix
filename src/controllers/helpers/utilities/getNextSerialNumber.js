const Event = require("../../../models/academic/Event");
const getNextSerialNumberForEvent = async (eventType) => {
  const lastEvent = await Event.findOne({ eventType })
    .sort({ createdAt: -1 }) // Sort by creation date in descending order
    .exec();
  if (!lastEvent) {
    return "01";
  }

  const lastId = lastEvent.eventCode;

  const lastSerialNumber = lastId.slice(-3, -1); // Get the serial number part

  let nextSerialNumber = parseInt(lastSerialNumber, 10) + 1;

  if (nextSerialNumber < 10) {
    nextSerialNumber = `0${nextSerialNumber}`;
  }
  return nextSerialNumber.toString();
};

module.exports = { getNextSerialNumberForEvent };
