const eligibilityStatus = require("../../../config/constants/progressStatusEligibilityCode");

const updateProjectFirstProgressStatus = (eligibility) => {
  try {
    switch (eligibility) {
      case eligibilityStatus.proposal.rejected:
        return "0000";
      case eligibilityStatus.proposal.eligibeForReportSubmission:
      case eligibilityStatus.proposal.defenseFail:
      case eligibilityStatus.proposal.createTeam:
        return "0001";
      case eligibilityStatus.proposal.eligibleForDefense:
        return "0002";
      case eligibilityStatus.proposal.defensePass:
      case eligibilityStatus.final.defenseFail:
      case eligibilityStatus.final.eligibeForReportSubmission:
        return "0010";
      case eligibilityStatus.final.eligibleForDefense:
        return "0011";
      case eligibilityStatus.final.defensePass:
        return "1000";
      default:
        // Handle any unexpected values
        console.error(`Unexpected eligibility value: ${eligibility}`);
        return null;
    }
  } catch (err) {
    console.error(`error-message: ${err.message}`);
    return null;
  }
};

module.exports = { updateProjectFirstProgressStatus };
