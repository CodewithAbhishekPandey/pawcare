const nodemailer = require('nodemailer');

// Generate a random 6-digit string
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const getEmailTemplate = (otp, userName, isResend = false) => {
  const introText = isResend 
    ? "Welcome back to Pawvetra! Please verify your email to get started."
    : "Welcome to Pawvetra! Please verify your email to get started.";

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <!-- Header bar -->
      <div style="background-color: #1A3A2A; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-family: sans-serif;">🐾 Pawvetra</h1>
      </div>
      
      <!-- Body section -->
      <div style="padding: 30px; color: #333333; line-height: 1.6;">
        <p style="font-size: 18px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">Hi ${userName},</p>
        <p style="font-size: 15px; margin-bottom: 24px;">${introText}</p>
        
        <!-- OTP display box -->
        <div style="background-color: #F0F9F4; border: 2px solid #2D6A4F; border-radius: 12px; text-align: center; padding: 20px; font-size: 42px; font-weight: bold; color: #1A3A2A; letter-spacing: 10px; margin-bottom: 24px;">
          ${otp}
        </div>
        
        <p style="font-size: 14px; color: #666666; margin-bottom: 8px;">This code expires in 10 minutes.</p>
        <p style="font-size: 14px; color: #666666; margin-bottom: 0;">If you did not create a Pawvetra account, ignore this email.</p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; color: #6B7C72; font-size: 12px; border-top: 1px solid #f1f5f9;">
        © 2025 Pawvetra · Gurugram, India · support@pawvetra.in
      </div>
    </div>
  `;
};

// Send standard OTP email
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"Pawvetra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Pawvetra verification code: ${otp}`,
      html: getEmailTemplate(otp, userName, false)
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('sendOTPEmail failed:', error);
    return { success: false, error: error.message };
  }
};

// Send resend OTP email
const resendOTPEmail = async (email, otp, userName) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"Pawvetra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your new Pawvetra verification code: ${otp}`,
      html: getEmailTemplate(otp, userName, true)
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('resendOTPEmail failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  resendOTPEmail
};
