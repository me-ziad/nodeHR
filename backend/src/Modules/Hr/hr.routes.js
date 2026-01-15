const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload');
const {
  createProfile,
  getProfile,
  updateProfile,
  addCompanyImages,
  updateCompanyImage,
  deleteCompanyImage
} = require('./hr.controller');

// HR Profile CRUD
router.post('/hr/profile', auth, createProfile);
router.get('/hr/profile', auth, getProfile);
router.put('/hr/profile', auth, upload.single('logo'), updateProfile);

// Company Images
router.post('/hr/profile/images', auth, upload.array('images', 10), addCompanyImages);
router.put('/hr/profile/images/update', auth, updateCompanyImage);
router.delete('/hr/profile/images/:imageId', auth, deleteCompanyImage);

module.exports = router;