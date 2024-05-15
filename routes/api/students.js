const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/studentController');
const roleList = require('../../config/roleList');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/students/:id')
    .put(verifyRoles(roleList.Student),studentController.updateStudent)


module.exports = router;