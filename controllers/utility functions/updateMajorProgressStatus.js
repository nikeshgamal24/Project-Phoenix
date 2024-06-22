const eligibilityStatus = require("../../config/progressStatusEligibilityCode");

const updateMajorProgressStatus = (eligibility) => {
  console.log("*****eligibility**********");
  console.log(eligibility);
  try {
    switch (eligibility) {
      case eligibilityStatus.proposal.eligibeForReportSubmission:
      case eligibilityStatus.proposal.defenseFail:
      case eligibilityStatus.proposal.createTeam:
        return "2001";
      case eligibilityStatus.proposal.eligibleForDefense:
        return "2002";
      case eligibilityStatus.proposal.defensePass:
      case eligibilityStatus.mid.defenseFail:
      case eligibilityStatus.mid.eligibeForReportSubmission:
        return "2010";
      case eligibilityStatus.mid.eligibleForDefense:
        return "2011";
      case eligibilityStatus.mid.defensePass:
      case eligibilityStatus.final.defenseFail:
      case eligibilityStatus.final.eligibeForReportSubmission:
        return "2020";
      case eligibilityStatus.final.eligibleForDefense:
        return "2021";
      case eligibilityStatus.final.defensePass:
        return "3000";
      default:
        // Handle any unexpected values
        console.error(`Unexpected eligibility value: ${eligibility}`);
        return null;
    }
  } catch (err) {
    console.error(`error-message-updating-progressStatus: ${err.message}`);
    return null;
  }
};

module.exports = { updateMajorProgressStatus };
