const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    registerNumber: { type: String, trim: true, uppercase: true },
    department: { type: String, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index(
  { registerNumber: 1 },
  { unique: true, partialFilterExpression: { registerNumber: { $type: 'string' } } }
);

module.exports = mongoose.model('User', userSchema);
