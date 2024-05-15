const Student = require('../../models/Students');
const updateRollAndBatch = async (res,email,rollNumber,batchNumber)=>{
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
              }
            );
          } 
    }catch(err){
        console.error(`error-message:${err.message}`);
        return res.sendStatus(400);
    }

}

module.exports = {updateRollAndBatch};