const express = require('express');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');
const User = require('../Model/user.model');

const router = express.Router();

// ✅ عرض كل المشاريع
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('projects');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ projects: user.projects });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ إضافة مشروع جديد مع صور من form-data
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { title, description, link, year, technologies } = req.body;

    // تجهيز التقنيات (ممكن تيجي comma-separated أو JSON string)
    let tech = [];
    if (technologies) {
      tech = Array.isArray(technologies)
        ? technologies
        : (technologies.trim().startsWith('[')
            ? JSON.parse(technologies)
            : technologies.split(',').map(t => t.trim()).filter(Boolean));
    }

    // تجهيز الصور اللي اتبعتت
    const imagePaths = (req.files || []).map(f => `/uploads/${f.filename}`);

    // بناء المشروع الجديد
    const newProject = {
      title,
      description,
      link,
      year: year ? Number(year) : undefined,
      technologies: tech,
      images: imagePaths
    };

    user.projects.push(newProject);
    await user.save();

    res.json({ message: 'Project added successfully', projects: user.projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ تعديل مشروع
router.put('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    Object.assign(project, updates);
    await user.save();

    res.json({ message: 'Project updated successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ حذف مشروع
router.delete('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // استخدم pull بدل remove علشان يبقى أوضح
    user.projects.pull(projectId);
    await user.save();

    res.json({ message: 'Project deleted successfully', projects: user.projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// ✅ رفع صور لمشروع معيّن
router.put('/:projectId/upload-images', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { projectId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const fileNames = req.files.map(file => `/uploads/${file.filename}`);
    project.images = [...(project.images || []), ...fileNames];

    await user.save();

    res.json({ message: 'Images uploaded successfully', project });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ حذف صورة واحدة من مشروع
router.delete('/:projectId/delete-image', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { imagePath } = req.body; // مثال: "/uploads/job-platform-2.png"

    if (!imagePath || typeof imagePath !== 'string') {
      return res.status(400).json({ message: 'imagePath is required as a string' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // فلترة الصور بحيث نشيل الصورة المطلوبة فقط
    const beforeCount = project.images.length;
    project.images = project.images.filter(img => img !== imagePath);

    if (project.images.length === beforeCount) {
      return res.status(404).json({ message: 'Image not found in project' });
    }

    await user.save();

    res.json({ message: 'Image deleted successfully', project });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
module.exports = router;