const determineAllProjectsEvaluatedByEvaluator = ({res,projects,evaluationType,defenseId,evaluatorId})=>{
    try{

    const allProjectEvaluated = projects.every((project) => {
      const subEvent = project[evaluationType];
      console.log("***************************************************************")
      console.log("🚀 ~ allProjectEvaluated ~ projectname:", project.projectName)

      const defenseObj = subEvent.defenses.find((defense) => {
        return defense.defense.toString() === defenseId;
      });
      console.log("🚀 ~ defenseObj ~ defenseObj:", defenseObj)

      const evaluatorObj = defenseObj.evaluators.find((evaluator) => {
          console.log("🚀 ~ evaluatorObj ~ evaluator:", evaluator)
        return evaluator.evaluator.toString() === evaluatorId;
      });
      console.log("🚀 ~ evaluatorObj ~ evaluatorObj:", evaluatorObj)

      console.log("🚀 ~ allProjectEvaluated ~ evaluatorObj.hasEvaluated:", evaluatorObj.hasEvaluated)
      console.log("***************************************************************")
      return evaluatorObj.hasEvaluated;
    });

    console.log("🚀 ~ allProjectEvaluated ~ inside utility allProjectEvaluated:", allProjectEvaluated)
    return allProjectEvaluated;
}catch(err){
    console.error(`error-on-determineAllProjectsEvaluatedByEvaluator:${err.message}`);
    return res.sendStatus(500);
}
}

module.exports = {determineAllProjectsEvaluatedByEvaluator}