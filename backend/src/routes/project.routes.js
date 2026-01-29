const express = require("express");
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/roles");
const User = require("../Model/user.model");
const uploadProjectImages = require("../middleware/projectUpload");

const router = express.Router();

// Get all projects
router.get("/", allowRoles("SEEKER"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("projects");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ projects: user.projects });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add new project + upload images
router.post("/", allowRoles("SEEKER"), uploadProjectImages.array("images", 5), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { title, description, link, year, technologies } = req.body;

    let tech = [];
    if (technologies) {
      tech = Array.isArray(technologies)
        ? technologies
        : (technologies.trim().startsWith("[")
            ? JSON.parse(technologies)
            : technologies.split(",").map(t => t.trim()).filter(Boolean));
    }

    // Cloudinary بيرجع URL مباشر في file.path
    const imageUrls = (req.files || []).map(f => f.path);

    const newProject = {
      title,
      description,
      link,
      year: year ? Number(year) : undefined,
      technologies: tech,
      images: imageUrls,
    };

    user.projects.push(newProject);
    await user.save();

    res.json({ message: "Project added successfully", projects: user.projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update project
router.put("/:projectId", auth, allowRoles("SEEKER"), async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    Object.assign(project, updates);
    await user.save();

    res.json({ message: "Project updated successfully", project });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete project
router.delete("/:projectId", auth, allowRoles("SEEKER"), async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    user.projects.pull(projectId);
    await user.save();

    res.json({ message: "Project deleted successfully", projects: user.projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Upload images to existing project
router.put("/:projectId/upload-images", auth, allowRoles("SEEKER"), uploadProjectImages.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { projectId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const imageUrls = req.files.map(file => file.path); // Cloudinary URLs
    project.images = [...(project.images || []), ...imageUrls];

    await user.save();
    res.json({ message: "Images uploaded successfully", project });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete image from project
router.delete("/:projectId/delete-image", auth, allowRoles("SEEKER"), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { imagePath } = req.body;

    if (!imagePath || typeof imagePath !== "string") {
      return res.status(400).json({ message: "imagePath is required as a string" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = user.projects.id(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const beforeCount = project.images.length;
    project.images = project.images.filter(img => img !== imagePath);

    if (project.images.length === beforeCount) {
      return res.status(404).json({ message: "Image not found in project" });
    }

    await user.save();
    res.json({ message: "Image deleted successfully", project });
  } catch (err) {
    console.error("Delete image error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;