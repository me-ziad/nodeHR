const HR = require('./hr.model');
const BASE_URL = process.env.BASE_URL || "https://node-hr.vercel.app";

//  Create HR Profile
exports.createProfile = async (req, res) => {
  try {
    const existing = await HR.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "HR profile already exists" });
    }

    const hr = new HR({
      userId: req.user.id,
      fullName: req.body.fullName,
      email: req.body.email,
      companyName: req.body.companyName,
      phone: req.body.phone,
      position: req.body.position,
      linkedin: req.body.linkedin,
      logo: `${BASE_URL}/uploads/default-company.png` 
    });

    await hr.save();
    res.json({ message: "HR profile created successfully", hr });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Get HR Profile
exports.getProfile = async (req, res) => {
  try {
    const hr = await HR.findOne({ userId: req.user.id });
    if (!hr) return res.status(404).json({ message: 'HR profile not found' });
    res.json(hr);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//  Update HR Profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.logo = `${BASE_URL}/uploads/${req.file.filename}`; 

    const hr = await HR.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!hr) return res.status(404).json({ message: 'HR profile not found' });
    res.json({ message: "HR profile updated successfully", hr });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Add company images
exports.addCompanyImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const captions = Array.isArray(req.body.captions) ? req.body.captions : [req.body.captions];
    const bios = Array.isArray(req.body.bios) ? req.body.bios : [req.body.bios];

    const imageObjects = req.files.map((file, index) => ({
      file: `${BASE_URL}/uploads/${file.filename}`, //  يرجع لينك مباشر للصورة
      caption: captions[index] || "",
      bio: bios[index] || "",
      uploadedAt: new Date()
    }));

    const hr = await HR.findOne({ userId: req.user.id });
    if (!hr) return res.status(404).json({ message: 'HR profile not found' });

    if (!Array.isArray(hr.images)) hr.images = [];
    hr.images.push(...imageObjects);
    await hr.save();

    res.json({ message: 'Company images added successfully', hr });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//  Update single company image (caption/bio)
exports.updateCompanyImage = async (req, res) => {
  try {
    const { imageId, caption, bio } = req.body;

    const hr = await HR.findOne({ userId: req.user.id });
    if (!hr) return res.status(404).json({ message: "HR profile not found" });

    const image = hr.images.id(imageId); // Mongoose subdocument
    if (!image) return res.status(404).json({ message: "Image not found" });

    if (caption !== undefined) image.caption = caption;
    if (bio !== undefined) image.bio = bio;

    await hr.save();
    res.json({ message: "Image updated successfully", hr });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Delete single company image
exports.deleteCompanyImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const hr = await HR.findOne({ userId: req.user.id });
    if (!hr) return res.status(404).json({ message: "HR profile not found" });

    hr.images = hr.images.filter(img => img._id.toString() !== imageId);

    await hr.save();
    res.json({ message: "Image deleted successfully", hr });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};