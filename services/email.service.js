// import "dotenv/config";
// import nodemailer from "nodemailer";

// class EmailService {
//   constructor() {
//     const user = process.env.SMTP_USER;
//     const pass = process.env.SMTP_PASS;

//     if (!user || !pass) {
//       console.warn(
//         "⚠️  WARNING: SMTP_USER or SMTP_PASS environment variables are missing!",
//       );
//     }

//     this.transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST || "smtp.gmail.com",
//       port: Number(process.env.SMTP_PORT) || 587,
//       secure: false, // true for 465, false for 587
//       auth: {
//         user: user,
//         pass: pass,
//       },
//     });
//   }

//   /**
//    * Send Verification OTP Email
//    */
//   async sendOTP(email, otp) {
//     const mailOptions = {
//       from: `"OwlSync" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Your Email Verification OTP",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
//           <h2 style="color: #333333; text-align: center;">Verify Your Email</h2>
//           <p style="color: #666666; font-size: 16px;">Use the following OTP code to verify your account. Valid for <strong>10 minutes</strong>.</p>
//           <div style="background-color: #f4f6f8; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8; border-radius: 6px; margin: 20px 0;">
//             ${otp}
//           </div>
//           <p style="color: #999999; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
//         </div>
//       `,
//     };

//     await this.transporter.sendMail(mailOptions);
//   }
// }

// export default new EmailService();

import "dotenv/config";

class EmailService {
  constructor() {
    if (!process.env.BREVO_API_KEY) {
      console.warn(
        "⚠️  WARNING: BREVO_API_KEY is missing in environment variables!",
      );
    }
  }

  /**
   * Send Verification OTP Email via Brevo HTTP API
   */
  async sendOTP(email, otp) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "OwlSync",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: email }],
        subject: "Your Email Verification OTP",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333333; text-align: center;">Verify Your Email</h2>
            <p style="color: #666666; font-size: 16px;">Use the following OTP code to verify your account. Valid for <strong>10 minutes</strong>.</p>
            <div style="background-color: #f4f6f8; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8; border-radius: 6px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #999999; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Brevo API error: ${response.status}`);
    }

    return data;
  }
}

export default new EmailService();
