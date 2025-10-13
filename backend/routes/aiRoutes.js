const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @desc    Analyze career with existing skills
 * @route   POST /api/ai/analyze-existing
 * @access  Private
 */
router.post('/analyze-existing', protect, async (req, res) => {
  try {
    const { industry, goals, experienceLevel = 'intermediate' } = req.body;
    
    if (!industry || !goals) {
      return res.status(400).json({ 
        error: 'Industry and goals are required' 
      });
    }

    // Get user's current skills
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format skills for AI analysis
    const skillsByCategory = {
      technical: user.skills?.technical?.map(s => s.name) || [],
      soft: user.skills?.soft?.map(s => s.name) || []
    };

    const preferences = {
      industry,
      goals,
      experienceLevel
    };

    // Call Python AI service
    const aiAnalysisResponse = await fetch('http://127.0.0.1:5000/ai/career-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills_by_category: skillsByCategory,
        preferences,
        experience_level: experienceLevel
      })
    });

    if (!aiAnalysisResponse.ok) {
      throw new Error('AI analysis service unavailable');
    }

    const aiAnalysis = await aiAnalysisResponse.json();

    res.json({
      message: 'Career analysis completed successfully',
      analysis: aiAnalysis,
      userSkills: skillsByCategory,
      preferences
    });

  } catch (error) {
    console.error('Error in analyze-existing:', error);
    res.status(500).json({ 
      error: 'Failed to analyze career with existing skills',
      details: error.message 
    });
  }
});

/**
 * @desc    Analyze career with new resume upload
 * @route   POST /api/ai/analyze-resume
 * @access  Private
 */
router.post('/analyze-resume', protect, upload.single('resume'), async (req, res) => {
  try {
    const { industry, goals, experienceLevel = 'intermediate' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    if (!industry || !goals) {
      return res.status(400).json({ 
        error: 'Industry and goals are required' 
      });
    }

    const filePath = req.file.path;

    try {
      // Step 1: Extract skills from resume using Python service
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: req.file.mimetype });
      formData.append('resume', blob, req.file.filename);

      const extractResponse = await fetch('http://127.0.0.1:5000/extract-skills', {
        method: 'POST',
        body: formData
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract skills from resume');
      }

      const extractedData = await extractResponse.json();
      const extractedSkills = extractedData.skills || [];

      // Step 2: Update user's skills in database
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Initialize skills if not exists
      if (!user.skills) {
        user.skills = { technical: [], soft: [] };
      }
      
      // Ensure both arrays exist
      if (!user.skills.technical) {
        user.skills.technical = [];
      }
      if (!user.skills.soft) {
        user.skills.soft = [];
      }

      // Add extracted skills (avoid duplicates)
      const addedSkills = [];
      extractedSkills.forEach(skill => {
        const skillType = skill.category === 'soft' ? 'soft' : 'technical';
        
        // Ensure the array exists before using .find()
        if (!Array.isArray(user.skills[skillType])) {
          user.skills[skillType] = [];
        }
        
        const exists = user.skills[skillType].find(
          s => s && s.name && s.name.toLowerCase() === skill.name.toLowerCase()
        );
        
        if (!exists) {
          const newSkill = {
            name: skill.name,
            level: skill.level || 'intermediate',
            verified: true // Verified because extracted from resume
          };
          user.skills[skillType].push(newSkill);
          addedSkills.push(newSkill);
        }
      });

      await user.save();

      // Step 3: Format skills for AI analysis (filter out null/undefined)
      const skillsByCategory = {
        technical: user.skills.technical
          .filter(s => s && s.name)
          .map(s => s.name),
        soft: user.skills.soft
          .filter(s => s && s.name)
          .map(s => s.name)
      };

      const preferences = {
        industry,
        goals,
        experienceLevel
      };

      // Step 4: Call AI analysis service
      console.log('Calling Flask AI service with:', { skillsByCategory, preferences, experienceLevel });
      
      const aiAnalysisResponse = await fetch('http://127.0.0.1:5000/ai/career-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills_by_category: skillsByCategory,
          preferences,
          experience_level: experienceLevel,
          resume_text: extractedData.extracted_info?.resume_text || ''
        })
      });

      console.log('Flask response status:', aiAnalysisResponse.status);
      
      if (!aiAnalysisResponse.ok) {
        const errorText = await aiAnalysisResponse.text();
        console.log('Flask error response:', errorText);
        throw new Error(`AI analysis service unavailable: ${errorText}`);
      }

      const aiAnalysis = await aiAnalysisResponse.json();

      res.json({
        message: 'Resume uploaded and career analysis completed successfully',
        analysis: aiAnalysis,
        extractedSkills: addedSkills,
        totalSkills: skillsByCategory,
        preferences,
        extractedInfo: extractedData.extracted_info
      });

    } finally {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

  } catch (error) {
    console.error('Error in analyze-resume:', error);
    res.status(500).json({ 
      error: 'Failed to analyze career with resume',
      details: error.message 
    });
  }
});

/**
 * @desc    Get AI analysis suggestions
 * @route   POST /api/ai/skill-suggestions
 * @access  Private
 */
router.post('/skill-suggestions', protect, async (req, res) => {
  try {
    const { targetRoles, preferences } = req.body;

    // Get user's current skills
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentSkills = [
      ...user.skills?.technical?.map(s => s.name) || [],
      ...user.skills?.soft?.map(s => s.name) || []
    ];

    // Call AI service for skill suggestions
    const aiResponse = await fetch('http://127.0.0.1:5000/ai/skill-improvements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_skills: currentSkills,
        target_roles: targetRoles,
        preferences
      })
    });

    if (!aiResponse.ok) {
      throw new Error('AI skill suggestion service unavailable');
    }

    const suggestions = await aiResponse.json();

    res.json({
      message: 'Skill suggestions generated successfully',
      suggestions,
      currentSkills
    });

  } catch (error) {
    console.error('Error in skill-suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to generate skill suggestions',
      details: error.message 
    });
  }
});

module.exports = router;