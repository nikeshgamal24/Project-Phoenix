// Function to parse expiration time string to seconds
const parseExpirationTime = (expirationTime) => {
  const unit = expirationTime.slice(-1);
  const value = parseInt(expirationTime.slice(0, -1));
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      throw new Error("Invalid expiration time format");
  }
};

module.exports = {parseExpirationTime};
