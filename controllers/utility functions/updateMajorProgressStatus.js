const eligibilityStatus = require("../../config/progressStatusEligibilityCode");

const updateMajorProgressStatus = (eligibility) => {
  console.log("*****eligibility**********");
  console.log(eligibility);
  try {
    if (
      eligibility === eligibilityStatus.proposal.eligibeForReportSubmission ||
      eligibility === eligibilityStatus.proposal.defenseFail ||
      eligibility === eligibilityStatus.proposal.createTeam
    ) {
      return "2001";
    } else if (eligibility === eligibilityStatus.proposal.eligibleForDefense) {
      return "2002";
    } else if (
      eligibility === eligibilityStatus.proposal.defensePass ||
      eligibility === eligibilityStatus.mid.defenseFail ||
      eligibility === eligibilityStatus.mid.eligibeForReportSubmission
    ) {
      return "2010";
    } else if (eligibility === eligibilityStatus.mid.eligibleForDefense) {
      return "2011";
    } else if (
      eligibility === eligibilityStatus.mid.defensePass ||
      eligibility === eligibilityStatus.final.defenseFail ||
      eligibility === eligibilityStatus.final.eligibeForReportSubmission
    ) {
      return "2020";
    } else if (eligibility === eligibilityStatus.final.eligibleForDefense) {
      return "2021";
    } else if (eligibility === eligibilityStatus.final.defensePass) {
      return "3000";
    }
  } catch (err) {
    console.error(`error-message-updating-progressStatus:${err.message}`);
    return null;
  }
};

module.exports = { updateMajorProgressStatus };
