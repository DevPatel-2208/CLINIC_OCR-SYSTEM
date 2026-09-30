const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  settings: {
    reportHeader: { type: String },
    reportFooter: { type: String },
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);