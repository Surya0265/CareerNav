const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { sendToPythonLLM } = require('../utils/apiClient');
const User = require('../models/User');

exports.handleResumeUpload = async (req, res) => {
  try {
    const resumePath = req.file.path;
    console.log("FILE:", req.file);
    console.log("Saved file path:", req.file.path);

    // Get dynamic data from frontend
    const industries = JSON.parse(req.body.industries || '[]');
    const goals = req.body.goals || '';
    const location = req.body.location || '';

    const result = await sendToPythonLLM({
      filePath: resumePath,
      industries,
      goals,
      location,
    });

    // Extract and save skills if the user is authenticated
    if (req.user && req.user._id && result.skills) {
      await saveSkillsToUser(req.user._id, result.skills);
      console.log(`Skills extracted and saved for user ${req.user._id}`);
    }

   // fs.unlinkSync(resumePath); // Cleanup
    res.json(result);
  } catch (error) {
    console.error('Resume processing error:', error.message);
    res.status(500).json({ error: 'Processing failed' });
  }
};

/**
 * Extract skills from resume and save to user profile
 */
async function saveSkillsToUser(userId, extractedSkills) {
  try {
    // Format skills for database
    const technicalSkills = Array.isArray(extractedSkills.technical) ? 
      extractedSkills.technical.map(skill => ({
        name: skill,
        level: 'intermediate',
        verified: true
      })) : [];
    
    const softSkills = Array.isArray(extractedSkills.soft) ? 
      extractedSkills.soft.map(skill => ({
        name: skill,
        level: 'intermediate',
        verified: true
      })) : [];
    
    // Find user and update skills directly
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found when saving skills');
      return false;
    }
    
    // Initialize skills object if it doesn't exist
    if (!user.skills) {
      user.skills = { technical: [], soft: [] };
    }
    
    // Add new skills, avoiding duplicates
    for (const skill of technicalSkills) {
      if (!user.skills.technical.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
        user.skills.technical.push(skill);
      }
    }
    
    for (const skill of softSkills) {
      if (!user.skills.soft.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
        user.skills.soft.push(skill);
      }
    }
    
    // Save user with updated skills
    await user.save();
    console.log(`Added ${technicalSkills.length} technical skills and ${softSkills.length} soft skills`);
    
    return true;
  } catch (error) {
    console.error('Error saving skills to user:', error);
    return false;
  }
}
