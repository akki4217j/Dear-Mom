import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['mom', 'partner'],
    required: [true, 'Role is required'],
  },
  dueDate: {
    type: Date,
    default: null,
  },
  partnerCode: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined (only moms get codes)
  },
  linkedPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate partner code for moms on creation
userSchema.pre('save', function (next) {
  if (this.isNew && this.role === 'mom' && !this.partnerCode) {
    // Generate a human-friendly 6-char code
    this.partnerCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  }
  next();
});

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

const User = mongoose.model('User', userSchema);
export default User;
