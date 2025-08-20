const progressStatusValidityForEvent = ({
  allowedEventType,
  studentProgressStatus,
}) => {
    const progressStatus = Number(studentProgressStatus)
    console.log("🚀 ~ progressStatus:", progressStatus, typeof progressStatus);
    console.log(
      "🚀 ~ progressStatusValidityForEvent ~ allowedEventType:",
      allowedEventType,
      typeof allowedEventType
    );
  switch (allowedEventType) {
    case "0":
      return progressStatus >= 0 && progressStatus < 1000;
    case "1":
      return progressStatus >= 1000 && progressStatus < 2000;
    case "2":
      return progressStatus >= 2000 && progressStatus < 3000;
    default:
      return false; // Handle default or unknown cases
  }
};


module.exports = {progressStatusValidityForEvent}