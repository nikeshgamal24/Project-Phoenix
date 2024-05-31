const  checkAccessCode = async(evaluators, accessCode, role) =>{
    let foundUser = null;
    let accessCodeMatched = false;
    let accessToken = null;
  
    for (const evaluator of evaluators) {
      console.log("before accessCodestatus");
      console.log(accessCode, evaluator.accessCode);
  
      const matchFound = await evaluator.defense.some(async (defenseObj) => {
        if (defenseObj.accessCode) {
          const accessCodeStatus = await bcrypt.compare(accessCode, evaluator.accessCode);
          console.log(accessCodeStatus);
          if (accessCodeStatus) {
            // Create JWTs for authorization
            // Creating access token
            accessToken = createAccessToken(
              evaluator,
              role,
              process.env.ACCESS_TOKEN_EXPIRATION_TIME
            );
            foundUser = evaluator;
            accessCodeMatched = true;
            return true; // Exit the loop as we've found a match
          }
        }
        return false;
      });
  
      if (matchFound) {
        break; // Exit the outer loop as we've found a match
      }
    }
  
    return { foundUser, accessCodeMatched, accessToken };
  }

  module.exports = {checkAccessCode}