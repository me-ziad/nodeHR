const express = require('express');
const auth = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles');
const upload = require('../middleware/upload'); // ✅ لإدارة form-data
const User = require('../Model/user.model');

const router = express.Router();

// ✅ عرض بروفايل الـ HR
router.get('/me', auth, allowRoles('HR'), async (req, res) => {
  try {
    const hr = await User.findById(req.user.id).select(
      'name email phone position avatar companyName companyWebsite companyDescription industry foundedYear size jobsPosted activeJobs applicationsReceived'
    );
    if (!hr) return res.status(404).json({ message: 'HR not found' });

    res.json(hr);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ تعديل بروفايل الـ HR باستخدام form-data
router.put('/me', auth, allowRoles('HR'), upload.single('avatar'), async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      position: req.body.position,
      companyName: req.body.companyName,
      companyWebsite: req.body.companyWebsite,
      companyDescription: req.body.companyDescription,
      industry: req.body.industry,
      foundedYear: req.body.foundedYear,
      size: req.body.size,
      jobsPosted: req.body.jobsPosted,
      activeJobs: req.body.activeJobs,
      applicationsReceived: req.body.applicationsReceived
    };

    // لو فيه صورة جديدة
    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const hr = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select(
      'name email phone position avatar companyName companyWebsite companyDescription industry foundedYear size jobsPosted activeJobs applicationsReceived'
    );

    if (!hr) return res.status(404).json({ message: 'HR not found' });
    res.json(hr);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;