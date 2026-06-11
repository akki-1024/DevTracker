const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  address: { type: String, trim: true },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
