const User = require('../models/User');
const { hashPassword, matchPassword, generateToken } = require('../utils/auth/authUtils');

/**
 * @desc    Register a new user
 * @route   POST /api/users/signup
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    console.log('Starting user registration process');
    const { name, email, password } = req.body;
    console.log(`Registration attempt for email: ${email}`);

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log(`Registration failed: User with email ${email} already exists`);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    console.log('Hashing password');
    const hashedPassword = await hashPassword(password);

    // Create new user
    console.log('Attempting to create new user in database');
    const userData = {
      name,
      email,
      password: hashedPassword,
      preferences: {
        industries: [],
        jobInterests: [],
        locationPreferences: []
      },
      accountSettings: {
        notifications: {
          email: true,
          jobAlerts: true,
          resourceUpdates: true
        },
        privacy: {
          profileVisibility: 'public',
          resumeVisibility: 'private'
        },
        theme: 'light'
      }
    };
    
    console.log('User data prepared:', { ...userData, password: '[HIDDEN]' });
    
    const user = await User.create(userData);
    console.log('User creation result:', user ? 'Success' : 'Failed');
    console.log('New user created with ID:', user._id);

    // If user creation was successful, generate token and send response
    if (user) {
      console.log('Generating token for user');
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        accountSettings: user.accountSettings,
        token: generateToken(user._id)
      });
    } else {
      console.error('User creation failed with no error thrown');
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    console.error('Full error stack:', error.stack);
    
    // Check if it's a MongoDB validation error
    if (error.name === 'ValidationError') {
      console.error('MongoDB validation error. Fields:', Object.keys(error.errors));
      Object.keys(error.errors).forEach(field => {
        console.error(`Field ${field} error:`, error.errors[field].message);
      });
    }
    
    // Check if it's a MongoDB duplicate key error
    if (error.code === 11000) {
      console.error('MongoDB duplicate key error on fields:', Object.keys(error.keyPattern));
    }
    
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await matchPassword(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        accountSettings: user.accountSettings,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        accountSettings: user.accountSettings
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;
      
      // Update preferences if provided
      if (req.body.preferences) {
        user.preferences = {
          ...user.preferences,
          ...req.body.preferences
        };
      }
      
      // Update account settings if provided
      if (req.body.accountSettings) {
        user.accountSettings = {
          ...user.accountSettings,
          ...req.body.accountSettings
        };
      }

      // Update password if provided
      if (req.body.password) {
        user.password = await hashPassword(req.body.password);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences,
        accountSettings: updatedUser.accountSettings,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Delete user profile
 * @route   DELETE /api/users/profile
 * @access  Private
 */
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in deleteUserProfile:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
      
      // Update preferences if provided
      if (req.body.preferences) {
        user.preferences = {
          ...user.preferences,
          ...req.body.preferences
        };
      }
      
      // Update account settings if provided
      if (req.body.accountSettings) {
        user.accountSettings = {
          ...user.accountSettings,
          ...req.body.accountSettings
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        isAdmin: updatedUser.isAdmin,
        preferences: updatedUser.preferences,
        accountSettings: updatedUser.accountSettings
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.isAdmin) {
        res.status(400).json({ error: 'Cannot delete admin user' });
        return;
      }
      
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};