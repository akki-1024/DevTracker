const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const upload = require('../middleware/upload');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { status, client, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const projects = await Project.find(filter)
      .populate('client', 'name company email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('client');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create project
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    await project.populate('client', 'name company email');
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).populate('client', 'name company email');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    // Delete associated files
    project.files.forEach(file => {
      const filePath = path.join(__dirname, '../uploads', file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload files to project
router.post('/:id/files', upload.array('files', 10), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const newFiles = req.files.map(f => ({
      originalName: f.originalname,
      filename: f.filename,
      mimetype: f.mimetype,
      size: f.size,
    }));

    project.files.push(...newFiles);
    await project.save();
    res.json(project.files);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a file from project
router.delete('/:id/files/:fileId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const file = project.files.id(req.params.fileId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(__dirname, '../uploads', file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    project.files.pull(req.params.fileId);
    await project.save();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
router.get('/meta/stats', async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const byStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const recentProjects = await Project.find()
      .populate('client', 'name company')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ total, byStatus, recentProjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
