const nodemailer = require('nodemailer');
require('dotenv').config();
const axios = require("axios");
const nodemailer = require('nodemailer');

// Create transporter with better error handling
const createTransporter = async () => {
  // Try Ethereal first if creds missing or in dev
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('📧 Using Ethereal Email for testing');
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } catch (error) {
      console.warn('⚠️ Ethereal unavailable, continuing without email transport');
    }
  }

  // Production Gmail configuration
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Gmail credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD }
  });
};

let transporter = null;
createTransporter().then(t => { transporter = t; }).catch(()=>{});

exports.sendOtpEmailUtil = async (email, otpCode) => {
  try {
    if (!transporter) {
      transporter = await createTransporter();
    }

    if (!transporter) {
      console.warn('⚠️ No email transporter configured; simulating OTP send for development');
      return; // Graceful no-op in dev environments without email
    }

    const mailOptions = {
      from: process.env.EMAIL || 'noreply@tathagat.com',
      to: email,
      subject: '🔐 TathaGat - Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5; text-align: center;">TathaGat OTP Verification</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="font-size: 18px; margin: 10px 0;">Your OTP code is:</p>
            <h1 style="font-size: 32px; color: #1a202c; letter-spacing: 4px; margin: 20px 0;">${otpCode}</h1>
            <p style="color: #718096; font-size: 14px;">This code will expire in 5 minutes.</p>
          </div>
          <p style="color: #4a5568; text-align: center; margin-top: 20px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
      text: `Your TathaGat OTP code is: ${otpCode}. It will expire in 5 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);

    if (info && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log('📧 Preview email: ' + previewUrl);
    }

    console.log(`✅ Email sent successfully to ${email} (Message ID: ${info?.messageId})`);

  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    // Do not throw to avoid 500 on environments without email config
  }
};

exports.sendOtpPhoneUtil = async (phoneNumber, otpCode) => {
  try {
    const payload = {
      api_key: process.env.KARIX_API_KEY,
      to: phoneNumber,
      sender: process.env.KARIX_SENDER_ID,
      message: `Your OTP is ${otpCode}`
    };
    const response = await axios.post("https://alerts.karix.co/api/v1/message", payload, { headers: { "Content-Type": "application/json" } });
    console.log("✅ OTP Sent Successfully!", response.data);
  } catch (error) {
    console.error("❌ Error sending OTP:", error.response ? error.response.data : error.message);
  }
};
