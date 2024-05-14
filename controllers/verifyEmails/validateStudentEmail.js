const validateStudentEmail = (studentEmail)=>{
    const studentEmailRegex = /^[a-zA-Z]+\.[0-9]{6}@ncit\.edu\.np$/;
    const studentEmailValidationStatus = studentEmailRegex.test(studentEmail);
    return studentEmailValidationStatus;
}

module.exports = {validateStudentEmail};