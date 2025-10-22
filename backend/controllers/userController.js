const User = require('../models/User');
const { hashPassword, matchPassword, generateToken } = require('../utils/auth/authUtils');
const { validatePasswordStrength } = require('../utils/passwordValidator');

const SKILL_LEVEL_MAP = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert'
};

const normalizeSkillType = (type) => {
  if (!type) return null;
  const lower = type.toString().toLowerCase();
  if (lower === 'technical') return 'technical';
  if (lower === 'soft') return 'soft';
  return null;
};

const formatLevelForStorage = (level) => {
  if (!level) return SKILL_LEVEL_MAP.intermediate;
  const mapped = SKILL_LEVEL_MAP[level.toString().toLowerCase()];
  return mapped || SKILL_LEVEL_MAP.intermediate;
};

const normalizeLevelForResponse = (level) => {
  if (!level) return 'intermediate';
  const lower = level.toString().toLowerCase();
  if (lower in SKILL_LEVEL_MAP) return lower;
  // handle capitalized values from legacy data
  const matchedKey = Object.keys(SKILL_LEVEL_MAP).find(
    (key) => SKILL_LEVEL_MAP[key] === level
  );
  return matchedKey || 'intermediate';
};

const ensureSkillBuckets = (user) => {
  let mutated = false;

  if (!user.skills) {
    user.skills = { technical: [], soft: [] };
    mutated = true;
  } else if (Array.isArray(user.skills)) {
    const technical = [];
    const soft = [];

    user.skills.forEach((skill = {}) => {
      if (!skill || !skill.name) return;
      const type = normalizeSkillType(skill.type) ||
        (skill.category && skill.category.toString().toLowerCase().includes('soft') ? 'soft' : 'technical');

      const formatted = {
        name: skill.name,
        level: formatLevelForStorage(skill.level),
        verified: Boolean(skill.verified),
        category: skill.category || undefined,
        _id: skill._id
      };

      if (type === 'soft') {
        soft.push(formatted);
      } else {
        technical.push(formatted);
      }
    });

    user.skills = { technical, soft };
    mutated = true;
  } else {
    const skillsObject = user.skills;
    if (!Array.isArray(skillsObject.technical)) {
      skillsObject.technical = [];
      mutated = true;
    }
    if (!Array.isArray(skillsObject.soft)) {
      skillsObject.soft = [];
      mutated = true;
    }
  }

  if (mutated && typeof user.markModified === 'function') {
    user.markModified('skills');
  }

  return mutated;
};

const mapSkillForResponse = (skill, type) => ({
  _id: skill._id,
  name: skill.name,
  level: normalizeLevelForResponse(skill.level),
  verified: Boolean(skill.verified),
  type,
  category: skill.category || null
});

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

    // Validate password strength before checking user existence
    console.log('[PASSWORD VALIDATION] Checking password strength');
    const passwordValidation = validatePasswordStrength(password);
    
    if (!passwordValidation.isValid) {
      console.log('[PASSWORD VALIDATION] Password validation failed:', passwordValidation.errors);
      return res.status(400).json({ 
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }
    console.log('[PASSWORD VALIDATION] Password meets security requirements');

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
      // `skills` is an array of skill objects in the User schema.
      // Initialize as empty array to avoid validation errors like:
      // "skills.0.name: Path `name` is required."
      skills: [],
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
    console.log('Received POST /api/users/login request');
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

/**
 * @desc    Get user skills
 * @route   GET /api/users/skills
 * @access  Private
 */
const getUserSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const mutated = ensureSkillBuckets(user);
    if (mutated) {
      await user.save();
    }

    const technicalSkills = (user.skills.technical || []).map((skill) =>
      mapSkillForResponse(skill, 'technical')
    );
    const softSkills = (user.skills.soft || []).map((skill) =>
      mapSkillForResponse(skill, 'soft')
    );

    res.json({
      technical: technicalSkills,
      soft: softSkills
    });
  } catch (error) {
    console.error('Error in getUserSkills:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Add user skill
 * @route   POST /api/users/skills
 * @access  Private
 */
const addUserSkill = async (req, res) => {
  try {
    const { name, level, type } = req.body;
    const skillType = normalizeSkillType(type);

    if (!name || !skillType) {
      return res.status(400).json({
        error: 'Please provide a skill name and valid type (technical or soft)'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    ensureSkillBuckets(user);

    const duplicateExists = [...user.skills.technical, ...user.skills.soft].some(
      (skill) => skill.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateExists) {
      return res.status(400).json({ error: 'Skill already exists' });
    }

    const newSkill = {
      name: name.trim(),
      level: formatLevelForStorage(level),
      verified: false,
      category: skillType === 'soft' ? 'Soft' : 'Technical'
    };

    user.skills[skillType].push(newSkill);
    user.markModified('skills');
    await user.save();

    const createdSkill = user.skills[skillType][user.skills[skillType].length - 1];

    res.status(201).json({
      message: 'Skill added successfully',
      skill: mapSkillForResponse(createdSkill, skillType)
    });
  } catch (error) {
    console.error('Error in addUserSkill:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Update user skill
 * @route   PUT /api/users/skills/:id
 * @access  Private
 */
const updateUserSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { name, level, type } = req.body;
    const requestedType = normalizeSkillType(type);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    ensureSkillBuckets(user);

    const findSkillIndex = (bucket) =>
      user.skills[bucket].findIndex((skill) => skill._id.toString() === skillId);

    let currentType = requestedType || null;
    let skillIndex = currentType ? findSkillIndex(currentType) : -1;

    if (skillIndex === -1) {
      const technicalIndex = findSkillIndex('technical');
      const softIndex = findSkillIndex('soft');

      if (technicalIndex !== -1) {
        currentType = 'technical';
        skillIndex = technicalIndex;
      } else if (softIndex !== -1) {
        currentType = 'soft';
        skillIndex = softIndex;
      }
    }

    if (skillIndex === -1 || !currentType) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const skillDoc = user.skills[currentType][skillIndex];

    if (name) {
      skillDoc.name = name.trim();
    }
    if (level) {
      skillDoc.level = formatLevelForStorage(level);
    }

    let targetType = currentType;

    if (requestedType && requestedType !== currentType) {
      const updatedSkill = skillDoc.toObject ? skillDoc.toObject() : { ...skillDoc };
      updatedSkill.level = skillDoc.level;
      updatedSkill.name = skillDoc.name;
      if (updatedSkill._id?.toString() !== skillId) {
        updatedSkill._id = skillId;
      }

      user.skills[currentType].splice(skillIndex, 1);
      user.skills[requestedType].push(updatedSkill);
      targetType = requestedType;
    }

    user.markModified('skills');
    await user.save();

    const updatedSkillDoc = user.skills[targetType].find(
      (skill) => skill._id.toString() === skillId
    );

    res.json({
      message: 'Skill updated successfully',
      skill: mapSkillForResponse(updatedSkillDoc || skillDoc, targetType)
    });
  } catch (error) {
    console.error('Error in updateUserSkill:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Delete user skill
 * @route   DELETE /api/users/skills/:id
 * @access  Private
 */
const deleteUserSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { type } = req.query;
    const requestedType = normalizeSkillType(type);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    ensureSkillBuckets(user);

    const removeFromBucket = (bucket) => {
      const index = user.skills[bucket].findIndex(
        (skill) => skill._id.toString() === skillId
      );
      if (index !== -1) {
        user.skills[bucket].splice(index, 1);
        return true;
      }
      return false;
    };

    let removed = false;

    if (requestedType) {
      removed = removeFromBucket(requestedType);
    } else {
      removed = removeFromBucket('technical') || removeFromBucket('soft');
    }

    if (!removed) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    user.markModified('skills');
    await user.save();

    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    console.error('Error in deleteUserSkill:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * @desc    Add multiple skills at once (useful for resume extraction)
 * @route   POST /api/users/skills/batch
 * @access  Private
 */
const addUserSkillsBatch = async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Please provide an array of skills' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    ensureSkillBuckets(user);

    const addedSkills = [];
    const existingSkills = [];
    
    // Process each skill
    for (const skill of skills) {
      const { name, level = 'intermediate', type = 'technical', verified = true } = skill;
      const normalizedType = normalizeSkillType(type) || 'technical';

      if (!name) {
        continue; // Skip invalid skills
      }

      // Check if skill already exists
      const skillExists = [...user.skills.technical, ...user.skills.soft].find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      
      if (skillExists) {
        existingSkills.push(name);
        continue;
      }
      
      // Add new skill
      const newSkill = { 
        name: name.trim(), 
        level: formatLevelForStorage(level),
        verified: Boolean(verified)
      };
      
      user.skills[normalizedType].push(newSkill);
      const storedSkill = user.skills[normalizedType][user.skills[normalizedType].length - 1];
      addedSkills.push(mapSkillForResponse(storedSkill, normalizedType));
    }
    
    user.markModified('skills');
    await user.save();
    
    res.status(201).json({
      message: 'Skills processed successfully',
      added: addedSkills,
      existing: existingSkills
    });
  } catch (error) {
    console.error('Error in addUserSkillsBatch:', error);
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
  deleteUser,
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  addUserSkillsBatch
};