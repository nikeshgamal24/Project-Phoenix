const Student = require('../../../models/user/Student');
const updateRollBatchAndStatus = async (res,email,rollNumber,batchNumber,progressStatus)=>{
    try{
        if(!email) return res.sendStatus(401);

        if(!rollNumber || !batchNumber)return res.sendStatus(400);

        if (email && rollNumber) {
            await Student.findOneAndUpdate(
              {
                email:email,
              },
              {
                rollNumber: rollNumber,
                batchNumber:batchNumber,
                progressStatus:progressStatus,
              }
            );
          } 
    }catch(err){
        console.error(`error-message:${err.message}`);
        return res.sendStatus(400);
    }

}

module.exports = {updateRollBatchAndStatus};