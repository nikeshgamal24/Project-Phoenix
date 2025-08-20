//returns a uppercase letter to append at the last of the custome event id
const getRandomUppercaseLetter = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
};

module.exports = { getRandomUppercaseLetter };
