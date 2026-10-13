import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register initial admin (only first user can self-register as admin)
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check existing user count
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({
        message: 'Admin already initialized. Additional accounts must be created by an Admin.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // First user is automatically assigned 'admin' role
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      walletAddress: walletAddress || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const registerAdmin = registerUser;

// @desc    Login user (admin or issuer)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const loginAdmin = loginUser;

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new issuer account (Admin only)
// @route   POST /api/auth/create-issuer
export const createIssuer = async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Create new issuer
    const issuer = await User.create({
      name,
      email,
      password,
      role: 'issuer',
      walletAddress: walletAddress ? walletAddress.trim() : '',
    });

    res.status(201).json({
      _id: issuer._id,
      name: issuer.name,
      email: issuer.email,
      role: issuer.role,
      walletAddress: issuer.walletAddress,
      createdAt: issuer.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get list of all issuers (Admin only)
// @route   GET /api/auth/issuers
export const getIssuers = async (req, res) => {
  try {
    const issuers = await User.find({ role: 'issuer' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(issuers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issuer details (Admin only)
// @route   PUT /api/auth/issuers/:id
export const updateIssuer = async (req, res) => {
  try {
    const { name, email, walletAddress, password } = req.body;
    const issuer = await User.findById(req.params.id);

    if (!issuer || issuer.role !== 'issuer') {
      return res.status(404).json({ message: 'Issuer not found' });
    }

    if (email && email.toLowerCase() !== issuer.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
      issuer.email = email;
    }

    if (name) issuer.name = name.trim();
    if (walletAddress !== undefined) issuer.walletAddress = walletAddress.trim();
    if (password && password.trim()) {
      issuer.password = password;
    }

    const updatedIssuer = await issuer.save();

    res.json({
      _id: updatedIssuer._id,
      name: updatedIssuer.name,
      email: updatedIssuer.email,
      role: updatedIssuer.role,
      walletAddress: updatedIssuer.walletAddress,
      updatedAt: updatedIssuer.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete issuer (Admin only)
// @route   DELETE /api/auth/issuers/:id
export const deleteIssuer = async (req, res) => {
  try {
    const issuer = await User.findById(req.params.id);

    if (!issuer || issuer.role !== 'issuer') {
      return res.status(404).json({ message: 'Issuer not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Issuer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};