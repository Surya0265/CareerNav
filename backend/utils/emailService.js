const nodemailer = require('nodemailer');

// Log environment variables (without password)
console.log('[EMAIL SERVICE] Initializing with:');
console.log('[EMAIL SERVICE] EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('[EMAIL SERVICE] EMAIL_USER:', process.env.EMAIL_USER);
console.log('[EMAIL SERVICE] PASSWORD_SET:', !!process.env.EMAIL_PASSWORD);
console.log('[EMAIL SERVICE] FRONTEND_URL:', process.env.FRONTEND_URL);

// Create email transporter with Gmail-specific settings
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Add these for better Gmail compatibility
  tls: {
    rejectUnauthorized: false
  },
  logger: true,
  debug: false,
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('[EMAIL SERVICE] ❌ Connection verification failed:', error.message);
    console.error('[EMAIL SERVICE] Error code:', error.code);
    console.error('[EMAIL SERVICE] Full error:', error);
  } else {
    console.log('[EMAIL SERVICE] ✅ Connection verified successfully');
  }
});

// Alternative: Use SMTP configuration
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: true, // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

exports.sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CareerNav - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">CareerNav</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Password Reset Request</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">Hello,</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password for your CareerNav account. 
              Click the button below to reset your password. This link will expire in 1 hour.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 40px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                font-size: 14px;
              ">Reset Your Password</a>
            </div>
            
            <p style="color: #999; font-size: 13px;">
              Or copy and paste this link in your browser:
              <br>
              <code style="background: #e8e8e8; padding: 5px 10px; border-radius: 3px; word-break: break-all;">
                ${resetUrl}
              </code>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              Best regards,<br>
              <strong>The CareerNav Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL SERVICE] Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending password reset email:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    throw error;
  }
};

exports.sendVerificationEmail = async (email, verificationToken, verificationUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CareerNav - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">CareerNav</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Email Verification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-top: 0;">Welcome to CareerNav!</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Please verify your email address to complete your registration and start planning your career journey.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 40px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                font-size: 14px;
              ">Verify Email</a>
            </div>
            
            <p style="color: #999; font-size: 13px;">
              Or copy and paste this link:
              <br>
              <code style="background: #e8e8e8; padding: 5px 10px; border-radius: 3px; word-break: break-all;">
                ${verificationUrl}
              </code>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              Best regards,<br>
              <strong>The CareerNav Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};
