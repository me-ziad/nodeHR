const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload');
const { getProfile, updateProfile, addCompanyImages } = require('./hr.controller');

// ✅ Get HR Profile
router.get('/profile', auth, getProfile);

// ✅ Update HR Profile (logo اختياري)
router.put('/profile', auth, upload.single('logo'), updateProfile);

// ✅ Add company images (multiple)
router.post('/profile/images', auth, upload.array('images', 5), addCompanyImages);

module.exports = router;