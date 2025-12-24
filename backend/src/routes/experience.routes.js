const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../Model/user.model');

const router = express.Router();

// ✅ عرض كل الـ experience
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('experience');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ experience: user.experience });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ إضافة تجربة جديدة
router.post('/', auth, async (req, res) => {
  try {
    const { company, position, startDate, endDate, description } = req.body;
    if (!company || !position) {
      return res.status(400).json({ message: 'Company and position are required' });
    }

    const user = await User.findById(req.user.id);
    user.experience.push({ company, position, startDate, endDate, description });
    await user.save();

    res.json({ message: 'Experience added successfully', experience: user.experience });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ تعديل تجربة موجودة
router.put('/:expId', auth, async (req, res) => {
  try {
    const { expId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user.id);
    const exp = user.experience.id(expId);
    if (!exp) return res.status(404).json({ message: 'Experience not found' });

    Object.assign(exp, updates); // تعديل الحقول اللي جت في الـ body
    await user.save();

    res.json({ message: 'Experience updated successfully', experience: user.experience });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /auth/experience/:expId
router.delete('/:expId', auth, async (req, res) => {
  try {
    const { expId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const beforeCount = (user.experience || []).length;

    // فلترة حسب _id
    user.experience = (user.experience || []).filter(
      (exp) => exp?._id?.toString() !== expId
    );

    if (user.experience.length === beforeCount) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    await user.save();
    res.json({ message: 'Experience deleted successfully', experience: user.experience });
  } catch (err) {
    console.error('Experience delete error:', err); // مهم علشان تشوف الخطأ الحقيقي في الـ console
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;