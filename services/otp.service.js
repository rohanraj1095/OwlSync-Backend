import crypto from "crypto";
import OTP from "../models/otp.model.js";
import emailService from "./email.service.js";

export class OTPService {
  /**
   * Generate a secure 6-digit numeric OTP
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send or resend OTP to user email
   */
  async sendVerificationOTP(email) {
    const otp = this.generateOTP();

    // Delete any previous OTPs associated with this email
    await OTP.deleteMany({ email });

    // Store new OTP
    await OTP.create({ email, otp });

    // Send Email
    await emailService.sendOTP(email, otp);

    return { success: true, message: "OTP sent successfully to email." };
  }

  /**
   * Verify provided OTP
   */
  async verifyOTP(email, inputOtp) {
    const record = await OTP.findOne({ email });

    if (!record) {
      return {
        isValid: false,
        message: "OTP has expired or was not requested.",
      };
    }

    if (record.otp !== inputOtp) {
      return {
        isValid: false,
        message: "Invalid OTP. Please check and try again.",
      };
    }

    // Single-use: Delete OTP record upon successful verification
    await OTP.deleteOne({ _id: record._id });

    return { isValid: true, message: "Email verified successfully." };
  }
}

export default new OTPService();
