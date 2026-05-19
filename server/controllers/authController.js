import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, dueDate, partnerCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Create user
    const userData = { name, email, password, role };

    if (role === 'mom' && dueDate) {
      userData.dueDate = new Date(dueDate);
    }

    const user = await User.create(userData);

    // If partner, try to link with mom via partner code
    if (role === 'partner' && partnerCode) {
      const momUser = await User.findOne({ partnerCode: partnerCode.toUpperCase() });
      if (momUser) {
        // Link both users
        user.linkedPartner = momUser._id;
        user.dueDate = momUser.dueDate; // Share due date
        await user.save();

        momUser.linkedPartner = user._id;
        await momUser.save();
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dueDate: user.dueDate,
        partnerCode: user.partnerCode,
        linkedPartner: user.linkedPartner,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    // Get linked partner info if exists
    let partnerInfo = null;
    if (user.linkedPartner) {
      partnerInfo = await User.findById(user.linkedPartner).select('name role');
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dueDate: user.dueDate,
        partnerCode: user.partnerCode,
        linkedPartner: user.linkedPartner,
        partnerName: partnerInfo?.name || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    let partnerInfo = null;
    if (user.linkedPartner) {
      partnerInfo = await User.findById(user.linkedPartner).select('name role');
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dueDate: user.dueDate,
        partnerCode: user.partnerCode,
        linkedPartner: user.linkedPartner,
        partnerName: partnerInfo?.name || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password - generate reset token
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In production, send email with reset link
    // For now, return the token directly (development mode)
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    res.json({
      message: 'Password reset token generated',
      resetToken, // Remove in production - only for development
      resetUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      message: 'Password reset successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Link partner with code
// @route   POST /api/auth/link-partner
export const linkPartner = async (req, res) => {
  try {
    const { partnerCode } = req.body;
    const user = req.user;

    if (user.linkedPartner) {
      return res.status(400).json({ message: 'You are already linked with a partner' });
    }

    const momUser = await User.findOne({ partnerCode: partnerCode.toUpperCase() });
    if (!momUser) {
      return res.status(404).json({ message: 'Invalid partner code' });
    }

    if (momUser.linkedPartner) {
      return res.status(400).json({ message: 'This mom is already linked with a partner' });
    }

    // Link both
    user.linkedPartner = momUser._id;
    user.dueDate = momUser.dueDate;
    await User.findByIdAndUpdate(user._id, {
      linkedPartner: momUser._id,
      dueDate: momUser.dueDate,
    });

    momUser.linkedPartner = user._id;
    await momUser.save();

    res.json({
      message: 'Partner linked successfully!',
      partnerName: momUser.name,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
