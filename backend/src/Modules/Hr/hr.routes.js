const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload');
const { createProfile, getProfile, updateProfile, addCompanyImages, updateCompanyImage, deleteCompanyImage } = require('./hr.controller');

router.post('/profile', auth, createProfile); // إنشاء HR جديد
router.get('/profile', auth, getProfile); // عرض بيانات HR
router.put('/profile', auth, upload.single('logo'), updateProfile); // تعديل بيانات HR
router.post('/profile/images', auth, upload.array('images', 10), addCompanyImages); 
// ✅ جديد
router.put("/profile/images/update",auth, updateCompanyImage);
router.delete("/profile/images/:imageId",auth, deleteCompanyImage);


module.exports = router; 
