const eligibilityStatus = require("../../config/progressStatusEligibilityCode");
const updateMinorProgressStatus = (eligibility) => {
  try {
    switch (eligibility) {
      case eligibilityStatus.proposal.eligibeForReportSubmission ||
        eligibilityStatus.proposal.defenseFail ||
        eligibilityStatus.proposal.createTeam:
        return "1001";
      case eligibilityStatus.proposal.eligibleForDefense:
        return "1002";
      case eligibilityStatus.proposal.defensePass ||
        eligibilityStatus.mid.defenseFail ||eligibilityStatus.mid.eligibeForReportSubmission:
        return "1010";
      case eligibilityStatus.mid.eligibleForDefense:
        return "1011";
      case eligibilityStatus.mid.defensePass ||eligibilityStatus.final.defenseFail ||eligibilityStatus.final.eligibeForReportSubmission:
        return "1020";
      case eligibilityStatus.final.eligibleForDefense:
        return "1021";
      case eligibilityStatus.final.defensePass:
        return "2000";
    }
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return null;
  }
};

module.exports = { updateMinorProgressStatus };
