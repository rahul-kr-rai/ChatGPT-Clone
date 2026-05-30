const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  salary: { type: String },
  jobUrl: { type: String },
  coverLetter: { type: String },
  status: { type: String, enum: ['applied', 'failed'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
