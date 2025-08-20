const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { AppError } = require("../../middleware/errorHandler");

class OTPService {
  /**
   * Generate cryptographically secure OTP
   */
  generateSecureOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash OTP for storage
   */
  async hashOTP(otp) {
    try {
      return await bcrypt.hash(otp, 12);
    } catch (error) {
      throw new AppError('Failed to hash OTP', 500);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(plainOtp, hashedOtp) {
    try {
      return await bcrypt.compare(plainOtp, hashedOtp);
    } catch (error) {
      throw new AppError('Failed to verify OTP', 500);
    }
  }

  /**
   * Check if OTP is expired
   */
  isOTPExpired(expirationDate) {
    if (!expirationDate) return true;
    return new Date() > new Date(expirationDate);
  }

  /**
   * Generate OTP expiration time (default 5 minutes)
   */
  generateExpirationTime(minutes = 5) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  /**
   * Generate complete OTP data for user
   */
  async generateOTPData(minutes = 5) {
    const otp = this.generateSecureOTP();
    const hashedOTP = await this.hashOTP(otp);
    const expirationTime = this.generateExpirationTime(minutes);

    return {
      plainOtp: otp,
      hashedOtp: hashedOTP,
      expirationTime
    };
  }
}

module.exports = new OTPService();
