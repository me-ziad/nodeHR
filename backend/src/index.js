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
const hrRoutes = require('./Modules/Hr/hr.routes');
const publicRoutes = require("./routes/public.routes");
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads/avatars')));
app.use('/uploads/projects', express.static(path.join(__dirname, '../uploads/projects')));
app.use('/auth/projects', projectRoutes);
app.use('/auth/skills', skillsRoutes);
app.use('/auth/experience', experienceRoutes);
app.use('/auth/education', educationRoutes);
app.use('/hr/profile', hrProfileRoutes);
app.use('/hr', hrRoutes);
app.use("/public", publicRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'Server is healthy 🚀' });
});

// بدل ما تعمل listen هنا، صدّر الـ app
// Vercel هيشغل الملف كـ Serverless Function
connectDB(process.env.MONGO_URI)
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ DB connection failed:", err));

module.exports = app;