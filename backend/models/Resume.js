const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  fileName: { type: String, required: true },
  atsScore: { type: Number, required: true },
  jobSearchQuery: { type: String },
  skills: [{ type: String }],
  missingKeywords: [{ type: String }],
  contentSuggestions: [{ type: String }],
  formattingSuggestions: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeSchema);
