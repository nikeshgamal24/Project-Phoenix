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
const evaluatorQueueProcessor = async (job) => {
  const { userId, evaluationData } = job.data;
  // Here you would update your database with the evaluation data
  console.log(`Processing evaluation for user ${userId}`);
  // Perform the database update (pseudo-code)
  const { statusCode, newEvaluation } =
  await evaluatorController.submitEvaluation({ userId, evaluationData });
  console.log("🚀 ~ evaluatorQueueProcessor ~ newEvaluation:", newEvaluation)
  console.log("🚀 ~ evaluatorQueueProcessor ~ statusCode:", statusCode)
  return { statusCode, newEvaluation }
};

// Set up the queue processor
evaluatorQueue.process(evaluatorQueueProcessor);
module.exports = evaluatorQueueProcessor;
