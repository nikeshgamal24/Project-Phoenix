// Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  console.log("🚀 ~ cosineSimilarity ~ vecA, vecB:", vecA, vecB)
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

  console.log("🚀 ~ cosineSimilarity ~ dotProduct:", dotProduct);
  console.log("🚀 ~ cosineSimilarity ~ magnitudeA:", magnitudeA);
  console.log("🚀 ~ cosineSimilarity ~ magnitudeB:", magnitudeB);
  // Prevent division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  console.log(
    "🚀 ~ cosineSimilarity ~ dotProduct / (magnitudeA * magnitudeB):",
    dotProduct / (magnitudeA * magnitudeB)
  );
  return dotProduct / (magnitudeA * magnitudeB);
};

// Transform skill set into binary vector representation
const getSkillVector = (skillSet, allSkills) => {
  return allSkills.map((skill) => (skillSet.includes(skill) ? 1 : 0));
};

module.exports = {
  cosineSimilarity,
  getSkillVector,
};
