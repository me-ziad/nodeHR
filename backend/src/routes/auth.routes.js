// src/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const { register, login } = require('../Controllers/auth.controller');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth.middleware');
const User = require('../Model/user.model');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// تسجيل مستخدم جديد
router.post('/register', upload.single('avatar'), register);

// تسجيل دخول
router.post('/login', login);

// بيانات المستخدم الحالي (مختصرة)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ بيانات البروفايل (تفصيلية) — مع المشاريع
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      address: user.address,
      position: user.position,
      cv: user.cv,
      cvUrl: user.cvUrl,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      projects: user.projects,  
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
// ✍️ تحديث بيانات البروفايل (skills + experience + education فقط)
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      bio: req.body.bio,
      phone: req.body.phone,
      address: req.body.address,
      position: req.body.position
    };

    // ✅ skills
    if (req.body.skills) {
      if (typeof req.body.skills === 'string') {
        updates.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        updates.skills = req.body.skills;
      }
    }

    // ✅ experience
    if (req.body.experience) {
      try {
        updates.experience = typeof req.body.experience === 'string'
          ? JSON.parse(req.body.experience)
          : req.body.experience;
      } catch {
        return res.status(400).json({ message: 'Invalid experience format' });
      }
    }

    // ✅ education
    if (req.body.education) {
      try {
        updates.education = typeof req.body.education === 'string'
          ? JSON.parse(req.body.education)
          : req.body.education;
      } catch {
        return res.status(400).json({ message: 'Invalid education format' });
      }
    }

    // صورة جديدة
    if (req.file) {
      updates.avatar = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ رفع CV
router.put('/upload-cv', auth, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileName = req.file.filename;
    const publicUrl = `/uploads/${fileName}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { cv: fileName, cvUrl: publicUrl } },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'CV uploaded successfully', cv: user.cv, cvUrl: user.cvUrl });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// نسيت الباسورد - إرسال كود OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    user.resetVerified = false;
    await user.save();

    const html = `
      <h2>Password Reset Code</h2>
      <p>Your reset code is:</p>
      <div style="font-size:24px;font-weight:bold">${otp}</div>
      <p>Valid for 15 minutes.</p>
    `;

    await sendEmail(email, 'Password Reset Code', html);

    res.json({ message: 'Reset code sent to email.' });
 } catch (err) {
  console.error("Forgot password error:", err); // ✅ يطبع الخطأ في الـ logs
  res.status(500).json({ message: err.message || 'Internal server error' });
}
});

// التحقق من الكود
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired code' });

    user.resetVerified = true;
    await user.save();

    res.json({ message: 'Code verified. You can now set a new password.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// تغيير الباسورد
router.post('/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findOne({ resetVerified: true });

    if (!user) return res.status(400).json({ message: 'No verified reset request found' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetVerified = false;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;