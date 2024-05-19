const eligibilityStatus = require("../../config/progressStatusEligibilityCode");
const updateProjectFirstProgressStatus = (eligibility) => {
  try {
    switch (eligibility) {
      case eligibilityStatus.proposal.eligibeForReportSubmission ||
        eligibilityStatus.proposal.defenseFail||eligibilityStatus.proposal.createTeam:
        return "0001";
      case eligibilityStatus.proposal.eligibleForDefense:
        return "0002";
      case eligibilityStatus.proposal.defensePass ||
        eligibilityStatus.final.defenseFail||eligibilityStatus.final.eligibeForReportSubmission:
        return "0010";
      case eligibilityStatus.final.eligibleForDefense:
        return "0011";
      case eligibilityStatus.final.defensePass:
        return "1000";
    }
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return null;
  }
};

module.exports = { updateProjectFirstProgressStatus };
