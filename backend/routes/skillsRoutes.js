const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Extract and store skills from a resume
// @route   POST /api/skills/extract
// @access  Private
router.post('/extract', protect, async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills data is required and must be an array' });
    }

    // Get the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Defensive: ensure all required fields exist and are strings
    const formattedSkills = skills.map(skill => ({
      name: typeof skill.name === 'string' ? skill.name : '',
      level: typeof skill.level === 'string' ? skill.level : 'Intermediate',
      verified: typeof skill.verified === 'boolean' ? skill.verified : false,
      category: typeof skill.category === 'string' ? skill.category : 'Other'
    }));

    // If user doesn't have a skills array, create one
    if (!user.skills) {
      user.skills = [];
    }

    // Add new skills, avoiding duplicates
    formattedSkills.forEach(newSkill => {
      if (!newSkill.name) return;
      const existingSkillIndex = user.skills.findIndex(
        s => typeof s.name === 'string' && s.name.toLowerCase() === newSkill.name.toLowerCase()
      );
      if (existingSkillIndex >= 0) {
        user.skills[existingSkillIndex] = {
          ...user.skills[existingSkillIndex],
          level: newSkill.level,
          verified: newSkill.verified,
          category: newSkill.category
        };
      } else {
        user.skills.push(newSkill);
      }
    });

    await user.save();
    res.status(200).json({ 
      message: 'Skills added successfully', 
      skills: user.skills
    });
  } catch (error) {
    console.error('Error adding skills:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// @desc    Add a new skill manually
// @route   POST /api/skills
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, level, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize skills array if it doesn't exist
    if (!user.skills) {
      user.skills = [];
    }

    // Check for duplicate
    const existingSkill = user.skills.find(skill => skill.name.toLowerCase() === name.toLowerCase());
    
    if (existingSkill) {
      return res.status(400).json({ error: 'Skill already exists' });
    }

    // Add the new skill
    const newSkill = {
      name,
      level: level || 'Beginner',
      verified: false,
      category: category || 'Other'
    };

    user.skills.push(newSkill);
    await user.save();

    res.status(201).json({ 
      message: 'Skill added successfully',
      skill: newSkill
    });
    
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// @desc    Get all user skills
// @route   GET /api/skills
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.skills || []);
    
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// @desc    Update a skill
// @route   PUT /api/skills/:skillId
// @access  Private
router.put('/:skillId', protect, async (req, res) => {
  try {
    const { name, level, verified, category } = req.body;
    const { skillId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.skills) {
      return res.status(404).json({ error: 'No skills found' });
    }

    const skillIndex = user.skills.findIndex(skill => skill._id.toString() === skillId);
    
    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Update the skill
    if (name) user.skills[skillIndex].name = name;
    if (level) user.skills[skillIndex].level = level;
    if (verified !== undefined) user.skills[skillIndex].verified = verified;
    if (category) user.skills[skillIndex].category = category;

    await user.save();

    res.status(200).json({ 
      message: 'Skill updated successfully',
      skill: user.skills[skillIndex]
    });
    
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// @desc    Delete a skill
// @route   DELETE /api/skills/:skillId
// @access  Private
router.delete('/:skillId', protect, async (req, res) => {
  try {
    const { skillId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.skills) {
      return res.status(404).json({ error: 'No skills found' });
    }

    // Find the skill by id
    const skillIndex = user.skills.findIndex(skill => skill._id.toString() === skillId);
    
    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Remove the skill
    user.skills.splice(skillIndex, 1);
    await user.save();

    res.status(200).json({ 
      message: 'Skill deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;