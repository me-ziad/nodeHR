const User  = require('../Model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



async function login(req, res) {
  try {
    const { email, password } = req.body;

    // تأكد إن المستخدم موجود
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // قارن الباسورد
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // اعمل token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        address: user.address,
        position: user.position,
        bio: user.bio,
        avatar: user.avatar,
      },
      accessToken: token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





async function register(req, res) {
  try {
    const { email, password, role, name, phone, address, company, position, bio } = req.body;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : 'default.png';

    // تحقق من الحقول الأساسية المطلوبة
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (!role) return res.status(400).json({ message: 'Role is required (HR or SEEKER)' });
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      role,
      name: String(name).trim(),
      phone,
      address,
      company,
      position,
      bio,
      avatar
    });

    try {
      await user.save();
    } catch (err) {
      if (err.name === 'ValidationError') {
        const first = Object.values(err.errors)[0];
        return res.status(422).json({ message: first?.message || 'Validation error' });
      }
      if (err.code === 11000) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      throw err;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        address: user.address,
        company: user.company,
        position: user.position,
        bio: user.bio,
        avatar: user.avatar
      },
      accessToken: token
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { register,login };