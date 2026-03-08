const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../services/notificationService');
const { passwordResetTemplate } = require('../services/emailTemplates');
const Settings = require('../models/SchoolSettings'); // Note: The KI showed SchoolSettings.js

// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide an email address" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (15 mins)
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Get school name for template
    const settings = await Settings.findOne();
    const schoolName = settings?.schoolName || "ESchool ERP";

    try {
      await sendEmail(
        user.email,
        `Password Reset Request - ${schoolName}`,
        `Reset your password here: ${resetUrl}`,
        passwordResetTemplate(user.name, resetUrl, schoolName)
      );

      res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (err) {
      console.error("Forgot password email failed:", err);
      // Clear fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Please provide a password (min 6 characters)" });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { forgotPassword, resetPassword };
