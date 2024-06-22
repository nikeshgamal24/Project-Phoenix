const progressStatusEligibilityCode = {
  proposal: {
    rejected:"00",
    createTeam:"00",
    eligibeForReportSubmission: "01",
    eligibleForDefense: "02",
    defenseFail: "03",
    defensePass: "04",
  },
  mid: {
    approvalFromSupervisor: "11",
    eligibleForDefense: "12",
    defenseFail: "13",
    defensePass: "14",
  },
  final: {
    approvalFromSupervisor: "21",
    eligibleForDefense: "22",
    defenseFail: "23",
    defensePass: "24",
  },
};

module.exports = progressStatusEligibilityCode