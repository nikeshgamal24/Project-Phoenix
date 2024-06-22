const eligibilityStatus = require("../../config/progressStatusEligibilityCode");

const updateMinorProgressStatus = (eligibility) => {
  try {
    switch (eligibility) {
      case eligibilityStatus.proposal.eligibeForReportSubmission:
      case eligibilityStatus.proposal.defenseFail:
      case eligibilityStatus.proposal.createTeam:
        return "1001";
      case eligibilityStatus.proposal.eligibleForDefense:
        return "1002";
      case eligibilityStatus.proposal.defensePass:
      case eligibilityStatus.mid.defenseFail:
      case eligibilityStatus.mid.eligibeForReportSubmission:
        return "1010";
      case eligibilityStatus.mid.eligibleForDefense:
        return "1011";
      case eligibilityStatus.mid.defensePass:
      case eligibilityStatus.final.defenseFail:
      case eligibilityStatus.final.eligibeForReportSubmission:
        return "1020";
      case eligibilityStatus.final.eligibleForDefense:
        return "1021";
      case eligibilityStatus.final.defensePass:
        return "2000";
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

module.exports = { updateMinorProgressStatus };
