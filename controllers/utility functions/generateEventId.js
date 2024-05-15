const eventTypeList = require("../../config/eventTypeList");
const { getNextSerialNumberForEvent } = require("./getNextSerialNumber");
const { getRandomUppercaseLetter } = require("./getRandomUppercaseLetter");

const generateEventId = async (eventType) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const eventTypeCode = eventTypeList[eventType];

  if (!eventTypeCode) {
    throw new Error(`Invalid event type: ${eventType}`);
  }

  const serialNumber = await getNextSerialNumberForEvent(eventType.toString());

  const randomLetter = getRandomUppercaseLetter();

  return `ET-${year}${eventTypeCode}${serialNumber}${randomLetter}`;
};

module.exports = { generateEventId };
