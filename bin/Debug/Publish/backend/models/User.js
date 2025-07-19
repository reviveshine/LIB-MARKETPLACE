const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  
  // User Role & Status
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'banned'],
    default: 'pending'
  },
  
  // Contact Information
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // KYC Verification
  kyc: {
    isVerified: {
      type: Boolean,
      default: false
    },
    submittedAt: Date,
    verifiedAt: Date,
    documents: [{
      type: {
        type: String,
        enum: ['passport', 'driver_license', 'national_id', 'utility_bill']
      },
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    rejectionReason: String
  },
  
  // Seller-specific fields
  businessInfo: {
    businessName: String,
    businessType: {
      type: String,
      enum: ['individual', 'company', 'partnership']
    },
    taxId: String,
    businessAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  
  // Profile
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Settings
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },
  
  // Security
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
UserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ 'kyc.isVerified': 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
