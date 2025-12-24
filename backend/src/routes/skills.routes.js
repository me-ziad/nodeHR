// src/routes/skills.routes.js
const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../Model/user.model');

const router = express.Router();

// ✅ عرض كل الـ skills
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skills');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ skills: user.skills });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ إضافة skill جديدة
router.post('/', auth, async (req, res) => {
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

// ✅ تعديل skill موجودة
router.put('/:oldSkill', auth, async (req, res) => {
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

// ✅ حذف skill معينة
router.delete('/:skill', auth, async (req, res) => {
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