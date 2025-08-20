const eventTypeList = require("../../../config/constants/eventTypeList");
const { getBatchYearFromEventType } = require("../utilities/getBatchYearFromEventType");
const { getNextSerialNumberForEvent } = require("../utilities/getNextSerialNumber");
const { getRandomUppercaseLetter } = require("../utilities/getRandomUppercaseLetter");

const generateEventId = async ({ eventType }) => {
  try {
    const year = new Date().getFullYear().toString().slice(-2);
    const eventTypeCode = eventTypeList[eventType];
    const batch = getBatchYearFromEventType(eventType).toString().slice(2);
    const eventTypeInitial =
      eventTypeCode === eventTypeList["2"]
        ? "M"
        : eventTypeCode === eventTypeList["1"]
        ? "N"
        : eventTypeCode === eventTypeList["0"]
        ? "F"
        : null;

    if (!eventTypeCode) {
      console.error(`Invalid event type: ${eventType}`);
      return null;
    }
    if (!eventTypeInitial) {
      console.error(`Invalid event type code: ${eventType}`);
      return null;
    }
    if (!batch) {
      console.error(`Invalid batch: ${batch}`);
      return null;
    }
    const serialNumber = await getNextSerialNumberForEvent(
      eventType.toString()
    );

    const randomLetter = getRandomUppercaseLetter();

    return `${eventTypeInitial}-${batch}-${eventTypeCode}${serialNumber}${randomLetter}`;
  } catch (err) {
    console.error(`error-message:${err.message}`);
  }
};

module.exports = { generateEventId };
