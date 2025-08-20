const cloudinary = require("cloudinary").v2;
const { AppError } = require("../../middleware/errorHandler");

class UploadService {
  constructor() {
    this.initializeCloudinary();
  }

  /**
   * Initialize Cloudinary configuration
   */
  initializeCloudinary() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(filePath, options = {}) {
    try {
      if (!filePath) {
        throw new AppError('File path is required', 400);
      }

      const defaultOptions = {
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
        folder: "project-phoenix"
      };

      const uploadOptions = { ...defaultOptions, ...options };
      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new AppError('File upload failed', 500);
    }
  }

  /**
   * Upload project report
   */
  async uploadProjectReport(filePath, projectId, defenseType) {
    try {
      const options = {
        folder: `project-phoenix/reports/${defenseType}`,
        public_id: `project_${projectId}_${defenseType}_${Date.now()}`,
        resource_type: "auto"
      };

      return await this.uploadFile(filePath, options);
    } catch (error) {
      throw new AppError('Failed to upload project report', 500);
    }
  }

  /**
   * Upload user profile photo
   */
  async uploadProfilePhoto(filePath, userId, userType) {
    try {
      const options = {
        folder: `project-phoenix/profiles/${userType}`,
        public_id: `${userType}_${userId}_${Date.now()}`,
        transformation: [
          { width: 400, height: 400, crop: "fill" },
          { quality: "auto" }
        ]
      };

      return await this.uploadFile(filePath, options);
    } catch (error) {
      throw new AppError('Failed to upload profile photo', 500);
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId) {
    try {
      if (!publicId) {
        throw new AppError('Public ID is required', 400);
      }

      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('File deletion error:', error);
      throw new AppError('Failed to delete file', 500);
    }
  }

  /**
   * Get file details
   */
  async getFileDetails(publicId) {
    try {
      if (!publicId) {
        throw new AppError('Public ID is required', 400);
      }

      const result = await cloudinary.api.resource(publicId);
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        created_at: result.created_at
      };
    } catch (error) {
      console.error('Get file details error:', error);
      throw new AppError('Failed to get file details', 500);
    }
  }
}

module.exports = new UploadService();
