const Event = require("../../models/Events");
const getNextSerialNumberForEvent = async (eventType) => {
  const lastEvent = await Event.findOne({ eventType })
    .sort({ createdAt: -1 }) // Sort by creation date in descending order
    .exec();
  if (!lastEvent) {
    return "01";
  }

  console.log("eventType");
  console.log(eventType);
  console.log("lastEvent");
  console.log(lastEvent);
  const lastId = lastEvent.eventCode;
  console.log("lastId");
  console.log(lastId);
  const lastSerialNumber = lastId.slice(-3, -1); // Get the serial number part

  let nextSerialNumber = parseInt(lastSerialNumber, 10) + 1;

  if (nextSerialNumber < 10) {
    nextSerialNumber = `0${nextSerialNumber}`;
  }
  return nextSerialNumber.toString();
};

module.exports = { getNextSerialNumberForEvent };
