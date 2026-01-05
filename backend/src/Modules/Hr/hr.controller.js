const HR = require('./hr.model');

// ✅ Get HR Profile
exports.getProfile = async (req, res) => {
  try {
    if (req.user.role !== 'HR') {
      return res.status(403).json({ message: 'Access denied: HR only' });
    }

    const hr = await HR.findOne({ userId: req.user.id });
    if (!hr) return res.status(404).json({ message: 'HR profile not found' });

    res.json(hr);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Update HR Profile
exports.updateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'HR') {
      return res.status(403).json({ message: 'Access denied: HR only' });
    }

    const updates = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      linkedin: req.body.linkedin,

      companyName: req.body.companyName,
      companyWebsite: req.body.companyWebsite,
      companyDescription: req.body.companyDescription,
      industry: req.body.industry,
      foundedYear: req.body.foundedYear,
      size: req.body.size,
      country: req.body.country,
      city: req.body.city,
      address: req.body.address,
      companyEmail: req.body.companyEmail,
      companyPhone: req.body.companyPhone,

      socials: {
        linkedin: req.body.companyLinkedin,
        twitter: req.body.twitter,
        glassdoor: req.body.glassdoor,
        careers: req.body.careers,
      },

      departments: req.body.departments ? req.body.departments.split(',').map(d => d.trim()) : [],
      benefits: req.body.benefits ? req.body.benefits.split(',').map(b => b.trim()) : [],
      values: req.body.values ? req.body.values.split(',').map(v => v.trim()) : [],

      workPolicy: req.body.workPolicy,

      preferences: {
        jobTypes: req.body.jobTypes ? req.body.jobTypes.split(',').map(j => j.trim()) : [],
        seniorityLevels: req.body.seniorityLevels ? req.body.seniorityLevels.split(',').map(s => s.trim()) : [],
        techStack: req.body.techStack ? req.body.techStack.split(',').map(t => t.trim()) : [],
      },

      visibility: req.body.visibility,
    };

    if (req.file) {
      updates.logo = req.file.filename;
    }

    const hr = await HR.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({ message: 'HR profile updated successfully', hr });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Add company images
exports.addCompanyImages = async (req, res) => {
  try {
    if (req.user.role !== 'HR') {
      return res.status(403).json({ message: 'Access denied: HR only' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const imageFiles = req.files.map(file => file.filename);

    const hr = await HR.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { images: { $each: imageFiles } } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Company images added successfully', hr });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};