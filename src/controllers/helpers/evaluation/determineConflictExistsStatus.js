const determineConflictExistsStatus = ({ matchingEvaluations ,projectEvaluation,individualEvaluation}) => {
  try {
    let conflictExists;
    if (matchingEvaluations.length) {
     conflictExists = matchingEvaluations.some((evaluation) => {
        if (
          projectEvaluation.judgement !== evaluation.projectEvaluation.judgement
        ) {
          return true;
        }

        for (let i = 0; i < individualEvaluation.length; i++) {
          if (
            individualEvaluation[i].absent !==
            evaluation.individualEvaluation[i].absent
          ) {
            return true;
          }
        }

        return false;
      });
    }

    console.log("🚀 ~ determineConflictExistsStatus inside determineConflictExistsStatus ~ conflictExists:", conflictExists)
    return conflictExists;
  } catch (err) {
    console.error(`error-on-conflictExists-section:${err.message}`);
  }
};

module.exports = { determineConflictExistsStatus };
