// const { format } = require('date-fns');
// const { v4: uuid } = require('uuid');

// const fs = require('fs');
// const fsPromises = require('fs').promises;
// const path = require('path');

// const logEvents = async (message, logName) => {
//     const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
//     const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

//     try {
//         if (!fs.existsSync(path.join(__dirname,'..', 'logs'))) {
//             await fsPromises.mkdir(path.join(__dirname,'..', 'logs'));
//         }

//         await fsPromises.appendFile(path.join(__dirname,'..', 'logs', logName), logItem);
//     } catch (err) {
//         console.log(err);
//     }
// }

// const logger =(req, res, next) => {
//     //logEvents takes 2 parameters i.e. message and logName (file name where the log is to be maintained)
//   logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`,'reqLog.txt');
//   next();
//   //since the middleware is a custom made so need to use next() whereas in case of built-in middleware we dont require next();
// }

// module.exports = {logger,logEvents};