const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  mimetype: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'review', 'completed', 'on-hold'],
    default: 'planning',
  },
  techStack: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  budget: { type: Number },
  currency: { type: String, default: 'USD' },
  repoUrl: { type: String },
  liveUrl: { type: String },
  files: [fileSchema],
  tags: [{ type: String }],
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
