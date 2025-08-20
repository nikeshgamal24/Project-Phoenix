const eligibilityStatus = require("../../../config/constants/progressStatusEligibilityCode");

const updateMinorProgressStatus = (eligibility) => {
  try {
    switch (eligibility) {
      case eligibilityStatus.proposal.rejected:
        return "1000";
      case eligibilityStatus.proposal.eligibeForReportSubmission:
      case eligibilityStatus.proposal.defenseFail:
      case eligibilityStatus.proposal.createTeam:
        return "1001";
      case eligibilityStatus.proposal.eligibleForDefense:
        return "1002";
      case eligibilityStatus.proposal.defensePass:
        return "1010";
      case eligibilityStatus.mid.approvalFromSupervisor:
      case eligibilityStatus.mid.defenseFail:
        return "1011";
      case eligibilityStatus.mid.eligibleForDefense:
        return "1012";
      case eligibilityStatus.mid.defensePass:
      case eligibilityStatus.final.eligibeForReportSubmission:
        return "1020";
      case eligibilityStatus.final.approvalFromSupervisor:
      case eligibilityStatus.final.defenseFail:
        return "1021";
      case eligibilityStatus.final.eligibleForDefense:
        return "2022";
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
