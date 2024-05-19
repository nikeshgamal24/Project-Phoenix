const eligibilityStatus = require("../../config/progressStatusEligibilityCode");
const updateMajorProgressStatus = (eligibility) => {
  try {
    switch (eligibility) {
      case eligibilityStatus.proposal.eligibeForReportSubmission ||
        eligibilityStatus.proposal.defenseFail ||
        eligibilityStatus.proposal.createTeam:
        return "2001";
      case eligibilityStatus.proposal.eligibleForDefense:
        return "2002";
      case eligibilityStatus.proposal.defensePass ||
        eligibilityStatus.mid.defenseFail ||eligibilityStatus.mid.eligibeForReportSubmission:
        return "2010";
      case eligibilityStatus.mid.eligibleForDefense:
        return "2011";
      case eligibilityStatus.mid.defensePass ||eligibilityStatus.final.defenseFail ||eligibilityStatus.final.eligibeForReportSubmission:
        return "2020";
      case eligibilityStatus.final.eligibleForDefense:
        return "2021";
      case eligibilityStatus.final.defensePass:
        return "3000";
    }
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return null;
  }
};

module.exports = { updateMajorProgressStatus };
