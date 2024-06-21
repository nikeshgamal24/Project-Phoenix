const defenseTypeCode = require("../../config/defenseTypeCodeList");

const determineDefenseType = (progressStatus) => {
  // Extract the last two digits from the progress status string
  const secondLastDigit = progressStatus.slice(-2,-1);
  console.log(secondLastDigit);
  switch (secondLastDigit) {
    case "0":
      return defenseTypeCode.proposal;
    case "1":
      return defenseTypeCode.mid;
    case "2":
      return defenseTypeCode.final;
    default:
        return "unknown";
  }
};

module.exports = { determineDefenseType };
