const Queue = require("bull");
const {
  REDIS_URI,
  REDIS_PORT,
  REDIS_TOKEN,
} = require("../config/redisCredentials");
const evaluatorController = require("../controllers/evaluatorController");

const evaluatorQueue = new Queue("evaluatorqueue", {
  redis: {
    port: REDIS_PORT,
    host: REDIS_URI,
    password: REDIS_TOKEN,
    tls: {},
  },
});

// Define the processing function
const evaluatorQueueProcessor = async (job,done) => {
  const { userId, evaluationData } = job.data;
  // Here you would update your database with the evaluation data
  console.log(`Processing evaluation for user ${userId}`);
  // Perform the database update (pseudo-code)
  const { statusCode } =
    await evaluatorController.submitEvaluation({ userId, evaluationData });
  console.log("🚀 ~ inside index in processor evaluatorQueueProcessor ~ statusCode:", statusCode);
  setTimeout(() => {
    done(null, statusCode);
  }, 1000);
};

// Set up the queue processor
evaluatorQueue.process(evaluatorQueueProcessor);
evaluatorQueue.on('complete',(job) => {
  console.log(`Completed #${job.id} Job`);
})
module.exports = evaluatorQueueProcessor;
