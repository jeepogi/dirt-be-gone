const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Customer', 'Staff'], default: 'Customer' },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  photo: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);