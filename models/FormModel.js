const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  jobDescription: { type: String, required: true },
  notes: { type: String },
  resumePath: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Form", formSchema);
