const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/employees');


router.route('/')
    .get(employeeController.getAllEmployees)
    .post(employeeController.createEmployee)
    .put(employeeController.updateEmployee)
    .delete(employeeController.deleteEmployee);

router.route('/:id')
    .get(employeeController.getEmployeeById);

module.exports = router;