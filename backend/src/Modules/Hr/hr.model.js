const mongoose = require('mongoose');

const hrSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ===== HR Personal Info =====
  fullName: { type: String, trim: true, required: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid HR email'],
    required: true
  },
  phone: { type: String, trim: true },
  position: { type: String, trim: true },
  linkedin: { type: String, trim: true },

  // ===== Company Info =====
  companyName: { type: String, trim: true, required: true },
  logo: { type: String, default: 'default-company.png' },
  companyDescription: { type: String, trim: true, maxlength: 2000 },
  industry: { type: String, trim: true },
  foundedYear: { type: Number },
  size: { type: String, trim: true },

  images: [{
    file: { type: String, required: true },
    caption: { type: String, trim: true },
    bio: { type: String, trim: true },
    uploadedAt: { type: Date, default: Date.now }
  }],

  country: { type: String, trim: true },
  city: { type: String, trim: true },
  address: { type: String, trim: true },
  companyEmail: { type: String, trim: true },
  companyPhone: { type: String, trim: true },
  companyWebsite: { type: String, trim: true },

  // ===== HR Socials (شخصية) =====
  socials: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    glassdoor: { type: String, trim: true },
    careers: { type: String, trim: true },
  },

  // ===== Company Links (رسمية) =====
  companyLinks: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    website: { type: String, trim: true },
    glassdoor: { type: String, trim: true },
    careers: { type: String, trim: true },
  },

  // ===== Company Culture =====
  departments: [{ type: String, trim: true }],
  benefits: [{ type: String, trim: true }],
  values: [{ type: String, trim: true }],
  workPolicy: {
    type: String,
    enum: ['Remote', 'Hybrid', 'Onsite'],
    default: 'Hybrid'
  },

  // ===== Hiring Preferences =====
  preferences: {
    jobTypes: [{ type: String, trim: true }],
    seniorityLevels: [{ type: String, trim: true }],
    techStack: [{ type: String, trim: true }],
  },

  visibility: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public'
  },
  verified: { type: Boolean, default: false },

}, { timestamps: true });

const HR = mongoose.model('HR', hrSchema);
module.exports = HR;