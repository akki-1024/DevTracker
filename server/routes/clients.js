const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Project = require('../models/Project');

// GET all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ name: 1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single client with their projects
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const projects = await Project.find({ client: req.params.id }).sort({ createdAt: -1 });
    res.json({ client, projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create client
router.post('/', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  try {
    const projectCount = await Project.countDocuments({ client: req.params.id });
    if (projectCount > 0) {
      return res.status(400).json({
        error: `Cannot delete client with ${projectCount} project(s). Remove projects first.`
      });
    }
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
