// Require the Cloudinary library
const cloudinary = require("cloudinary").v2;

//set cloudinary config section
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret:process.env.API_SECRET,
});

const uploadFile = async (filePath) => {
    try{
        const result = await cloudinary.uploader.upload(filePath);
        console.log('result after cloudinary uploader');
        console.log(result);
        return result
    }catch(err){
        console.error(`error-file-upload:${err.message}`);
    }
};

module.exports= { uploadFile };
