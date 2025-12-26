const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./bd');
const authRouter = require('./routes/auth.routes');
const path = require('path');
const projectRoutes = require('./routes/project.routes');
const skillsRoutes = require('./routes/skills.routes');
const experienceRoutes = require('./routes/experience.routes');
const educationRoutes = require('./routes/education.routes');
const hrProfileRoutes = require('./routes/hrProfile.routes'); 

const app = express();

// ✅ إعداد CORS مرة واحدة بس
app.use(cors({
  origin: 'http://localhost:3000', // أو دومين الـ frontend
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(express.json());

app.use('/auth', authRouter);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads/avatars')));
app.use('/auth/projects', projectRoutes);
app.use('/auth/skills', skillsRoutes);
app.use('/auth/experience', experienceRoutes);
app.use('/auth/education', educationRoutes);
app.use('/hr/profile', hrProfileRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'Server is healthy 🚀' });
});

const port = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`✅ Server running on port ${port}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();