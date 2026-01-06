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

    // هات الـ HR الحالي
    const existing = await HR.findOne({ userId: req.user.id });
    if (!existing) {
      return res.status(404).json({ message: 'HR profile not found' });
    }

    // جهز الـ updates من الـ body
    const updates = {
      fullName: req.body.fullName ?? existing.fullName,
      email: req.body.email ?? existing.email,
      phone: req.body.phone ?? existing.phone,
      position: req.body.position ?? existing.position,
      linkedin: req.body.linkedin ?? existing.linkedin,

      companyName: req.body.companyName ?? existing.companyName,
      companyWebsite: req.body.companyWebsite ?? existing.companyWebsite,
      companyDescription: req.body.companyDescription ?? existing.companyDescription,
      industry: req.body.industry ?? existing.industry,
      foundedYear: req.body.foundedYear ?? existing.foundedYear,
      size: req.body.size ?? existing.size,
      country: req.body.country ?? existing.country,
      city: req.body.city ?? existing.city,
      address: req.body.address ?? existing.address,
      companyEmail: req.body.companyEmail ?? existing.companyEmail,
      companyPhone: req.body.companyPhone ?? existing.companyPhone,

      socials: {
        linkedin: req.body.companyLinkedin ?? existing.socials?.linkedin,
        twitter: req.body.twitter ?? existing.socials?.twitter,
        glassdoor: req.body.glassdoor ?? existing.socials?.glassdoor,
        careers: req.body.careers ?? existing.socials?.careers,
      },

      departments: req.body.departments
        ? req.body.departments.split(",").map((d) => d.trim())
        : existing.departments,
      benefits: req.body.benefits
        ? req.body.benefits.split(",").map((b) => b.trim())
        : existing.benefits,
      values: req.body.values
        ? req.body.values.split(",").map((v) => v.trim())
        : existing.values,

      workPolicy: req.body.workPolicy ?? existing.workPolicy,

      preferences: {
        jobTypes: req.body.jobTypes
          ? req.body.jobTypes.split(",").map((j) => j.trim())
          : existing.preferences?.jobTypes,
        seniorityLevels: req.body.seniorityLevels
          ? req.body.seniorityLevels.split(",").map((s) => s.trim())
          : existing.preferences?.seniorityLevels,
        techStack: req.body.techStack
          ? req.body.techStack.split(",").map((t) => t.trim())
          : existing.preferences?.techStack,
      },

      visibility: req.body.visibility ?? existing.visibility,
    };

    if (req.file) {
      updates.logo = req.file.filename;
    }

    // اعمل التحديث
    const hr = await HR.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    res.json({ message: "HR profile updated successfully", hr });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Add company images (with caption & bio)
exports.addCompanyImages = async (req, res) => {
  try {
    if (req.user.role !== 'HR') {
      return res.status(403).json({ message: 'Access denied: HR only' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // اقرأ الحقول من الـ body
    const captions = Array.isArray(req.body.captions) ? req.body.captions : [req.body.captions];
    const bios = Array.isArray(req.body.bios) ? req.body.bios : [req.body.bios];

    // جهز الـ objects
    const imageObjects = req.files.map((file, index) => ({
      file: file.filename,
      caption: captions[index] || "",
      bio: bios[index] || "",
      uploadedAt: new Date()
    }));

    const hr = await HR.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { images: { $each: imageObjects } } },
      { new: true }
    );

    res.json({ message: 'Company images added successfully', hr });
  } catch (err) {
    console.error("addCompanyImages error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};