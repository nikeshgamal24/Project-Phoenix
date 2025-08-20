const multer = require("multer");

const uploader = multer({
    storage:multer.diskStorage({}),
    limits:{fileSize:25000000}
});

module.exports = {uploader}