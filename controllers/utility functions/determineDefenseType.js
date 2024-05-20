const defenseTypeCode = require("../../config/defenseTypeCodeList");

const determineDefenseType = (progressStatus) => {
  // Extract the last two digits from the progress status string
  const lastTwoDigits = progressStatus.slice(-2);
  switch (lastTwoDigits) {
    case "01":
      return defenseTypeCode.proposal;
    case "10":
      return defenseTypeCode.mid;
    case "20":
      return defenseTypeCode.final;
    default:
        return "unknown";
  }
};

module.exports = { determineDefenseType };
