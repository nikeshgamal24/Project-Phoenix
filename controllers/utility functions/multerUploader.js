const multer = require("multer");

const uploader = multer({
    storage:multer.diskStorage({}),
    limits:{fileSize:10000000}
});

module.exports = {uploader}