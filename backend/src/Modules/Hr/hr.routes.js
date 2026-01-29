const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.middleware');
 const { createProfile, getProfile, updateProfile, addCompanyImages, updateCompanyImage, deleteCompanyImage } = require('./hr.controller');
const { uploadAvatar } = require('../../middleware/upload');

router.post('/profile', auth, createProfile); 
router.get('/profile', auth, getProfile); 
router.put('/profile', auth, uploadAvatar.single('logo'), updateProfile); 
router.post('/profile/images', auth, uploadAvatar.array('images', 10), addCompanyImages); 
router.put("/profile/images/update",auth, updateCompanyImage);
router.delete("/profile/images/:imageId",auth, deleteCompanyImage);


module.exports = router; 
