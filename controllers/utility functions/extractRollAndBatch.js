const extractRollAndBatch = (email) => {
 try{
  const regex = /^[a-zA-Z]+\.([0-9]{6})@ncit\.edu\.np$/;
  const match = email.match(regex);
  if (match && match[1]) {
    const rollNumber = parseInt(match[1], 10);
    // Assuming the batch is a two-digit year from 2000 onwards
    const batchNumber = parseInt(match[1].substring(0, 2), 10) + 2000;
    return { rollNumber, batchNumber };
  } else {
    throw new Error('Invalid email format');
  }
 }catch(err){
  console.error(`error-message:${err.message}`);
  return res.sendStatus(400);
 }
};

module.exports = { extractRollAndBatch };
