// Function to filter out sensitive fields from an object
const filterSensitiveFields = (obj, sensitiveFields) => {
  try{
    const filteredObj = { ...obj };

    //set undefined to specified fields of the obj passed
    sensitiveFields.forEach((field) => {
      filteredObj[field] = undefined;
    });
    return filteredObj;
  }catch(err){
     console.error(`error_message_filtering_senstive_fields:${err.message}`);
     return null;
  }
  
};

module.exports = { filterSensitiveFields };
