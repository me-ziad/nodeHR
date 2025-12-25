const express = require('express');
const auth = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles'); // ✅ middleware للتحكم في الصلاحيات
const User = require('../Model/user.model');

const router = express.Router();

// ✅ عرض كل الـ education (خاص بالـ Seeker فقط)
router.get('/', auth, allowRoles('SEEKER'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('education');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ education: user.education });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ إضافة تعليم جديد (خاص بالـ Seeker فقط)
router.post('/', auth, allowRoles('SEEKER'), async (req, res) => {
  try {
    const { school, degree, fieldOfStudy, startDate, endDate, description } = req.body;
    if (!school || !degree) {
      return res.status(400).json({ message: 'School and degree are required' });
    }

    const user = await User.findById(req.user.id);
    user.education.push({ school, degree, fieldOfStudy, startDate, endDate, description });
    await user.save();

    res.json({ message: 'Education added successfully', education: user.education });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ تعديل تعليم موجود (خاص بالـ Seeker فقط)
router.put('/:eduId', auth, allowRoles('SEEKER'), async (req, res) => {
  try {
    const { eduId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user.id);
    const edu = user.education.id(eduId);
    if (!edu) return res.status(404).json({ message: 'Education not found' });

    Object.assign(edu, updates);
    await user.save();

    res.json({ message: 'Education updated successfully', education: user.education });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ حذف تعليم معين (خاص بالـ Seeker فقط)
router.delete('/:eduId', auth, allowRoles('SEEKER'), async (req, res) => {
  try {
    const { eduId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const beforeCount = (user.education || []).length;

    user.education = (user.education || []).filter(
      (edu) => edu?._id?.toString() !== eduId
    );

    if (user.education.length === beforeCount) {
      return res.status(404).json({ message: 'Education not found' });
    }

    await user.save();
    res.json({ message: 'Education deleted successfully', education: user.education });
  } catch (err) {
    console.error('Education delete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;