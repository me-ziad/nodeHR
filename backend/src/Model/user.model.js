const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: {
      values: ['HR', 'SEEKER'],
      message: 'Role must be either HR or SEEKER'
    },
    required: [true, 'Role is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  phone: {
    type: String,
    match: [/^\+?[0-9\s]{7,20}$/, 'Please enter a valid phone number']
  },
  address: { type: String, trim: true },
  position: { type: String, trim: true }, // منصب الشخص (HR Manager أو الوظيفة المستهدفة للـ seeker)
  bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
  avatar: { type: String, default: 'default.png' },
    // ✅ روابط شخصية للـ SEEKER
  github: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  portfolio: { type: String, trim: true },   // موقع شخصي أو Portfolio
  behance: { type: String, trim: true },     // لو مصمم
  dribbble: { type: String, trim: true },    // لو مصمم
  twitter: { type: String, trim: true },  

  // ✅ حقول خاصة بالـ HR
  companyName: { type: String, trim: true },
  companyWebsite: { type: String, trim: true },
  companyDescription: { type: String, trim: true },
  industry: { type: String, trim: true },
  foundedYear: { type: Number },
  size: { type: String, trim: true }, // Small, Medium, Enterprise

  // ✅ نشاط التوظيف للـ HR
  jobsPosted: { type: Number, default: 0 },            // عدد الوظائف اللي نشرها
  activeJobs: { type: Number, default: 0 },            // الوظائف الحالية المفتوحة
  applicationsReceived: { type: Number, default: 0 },  // عدد الطلبات اللي وصلت

  // ✅ حقول خاصة بالـ SEEKER
  cv: { type: String, default: null },      // اسم الملف
  cvUrl: { type: String, default: null },   // رابط الوصول للملف
  skills: [{ type: String, trim: true }],
  experience: [{
    company: { type: String, trim: true },
    position: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String, trim: true }
  }],
  education: [{
    school: { type: String, trim: true, required: true },
    degree: { type: String, trim: true, required: true },
    fieldOfStudy: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    graduationYear: { type: Number },
    description: { type: String, trim: true }
  }],
  projects: [{
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    link: { type: String, trim: true },
    technologies: [{ type: String, trim: true }],
    year: { type: Number },
    images: [{ type: String }]
  }],

  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetVerified: { type: Boolean, default: false }
}, { versionKey: false });

const User = mongoose.model('User', userSchema);
module.exports = User;