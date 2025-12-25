// src/routes/skills.routes.js
const express = require('express');
const auth = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles'); // ✅ Middleware للتحكم في الصلاحيات
const User = require('../Model/user.model');

const router = express.Router();

// ✅ عرض كل الـ skills (خاص بالـ Seeker فقط)
router.get('/', auth, allowRoles('SEEKER'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skills');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ skills: user.skills });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ إضافة skill جديدة (خاص بالـ Seeker فقط)
router.post('/', auth, allowRoles('SEEKER'), async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ message: 'Skill is required' });

    const user = await User.findById(req.user.id);
    user.skills.push(skill);
    await user.save();

    res.json({ message: 'Skill added successfully', skills: user.skills });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ تعديل skill موجودة (خاص بالـ Seeker فقط)
router.put('/:oldSkill', auth, allowRoles('SEEKER'), async (req, res) => {
  try {
    const { oldSkill } = req.params;
    const { newSkill } = req.body;

    const user = await User.findById(req.user.id);
    user.skills = user.skills.map(s => s === oldSkill ? newSkill : s);
    await user.save();

    res.json({ message: 'Skill updated successfully', skills: user.skills });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ حذف skill معينة (خاص بالـ Seeker فقط)
router.delete('/:skill', auth, allowRoles('SEEKER'), async (req, res) => {
  try {
    const { skill } = req.params;

    const user = await User.findById(req.user.id);
    user.skills = user.skills.filter(s => s !== skill);
    await user.save();

    res.json({ message: 'Skill deleted successfully', skills: user.skills });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;