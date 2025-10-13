const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { sendToPythonLLM } = require('../utils/apiClient');
const User = require('../models/User');
const Resume = require('../models/Resume');

const sanitizeString = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const sanitizeArrayOfStrings = (value) => {
  if (!Array.isArray(value)) return [];
  const deduped = [];
  for (const item of value) {
    const sanitized = sanitizeString(item);
    if (!sanitized) continue;
    if (!deduped.includes(sanitized)) {
      deduped.push(sanitized);
    }
  }
  return deduped;
};

const sanitizeSkillsByCategory = (value) => {
  if (!value || typeof value !== 'object') return {};
  return Object.entries(value).reduce((acc, [category, skills]) => {
    const sanitizedSkills = sanitizeArrayOfStrings(skills);
    if (sanitizedSkills.length) {
      acc[category] = sanitizedSkills;
    }
    return acc;
  }, {});
};

const sanitizePersonalInfo = (raw = {}) => {
  if (!raw || typeof raw !== 'object') return {};
  const info = {};
  const name = sanitizeString(raw.name) || sanitizeString(raw.full_name);
  if (name) {
    info.name = name;
  }
  const email = sanitizeString(raw.email);
  if (email) {
    info.email = email;
  }
  return info;
};

const sanitizeExtractedInfo = (raw = {}) => {
  if (!raw || typeof raw !== 'object') return {};

  const safe = {};

  const name = sanitizeString(raw.name) || sanitizeString(raw.full_name);
  if (name) {
    safe.name = name;
  }

  const fullName = sanitizeString(raw.full_name);
  if (fullName) {
    safe.full_name = fullName;
  }

  const email = sanitizeString(raw.email);
  if (email) {
    safe.email = email;
  }

  const detectedSkills = sanitizeArrayOfStrings(raw.detected_skills);
  if (detectedSkills.length) {
    safe.detected_skills = detectedSkills;
  }

  const skillsByCategory = sanitizeSkillsByCategory(raw.skills_by_category);
  if (Object.keys(skillsByCategory).length) {
    safe.skills_by_category = skillsByCategory;
  }

  const parsedTotalSkills = Number(raw.total_skills_found);
  if (Number.isFinite(parsedTotalSkills) && parsedTotalSkills >= 0) {
    safe.total_skills_found = parsedTotalSkills;
  } else if (detectedSkills.length) {
    safe.total_skills_found = detectedSkills.length;
  }

  const experienceEntries = sanitizeArrayOfStrings(raw.experience_entries);
  if (experienceEntries.length) {
    safe.experience_entries = experienceEntries;
  }

  const projectEntries = sanitizeArrayOfStrings(raw.project_entries);
  if (projectEntries.length) {
    safe.project_entries = projectEntries;
  }

  const experienceKeywords = sanitizeArrayOfStrings(raw.experience_keywords);
  if (experienceKeywords.length) {
    safe.experience_keywords = experienceKeywords;
  }

  if (typeof raw.has_experience_keywords === 'boolean') {
    safe.has_experience_keywords = raw.has_experience_keywords;
  } else if (experienceEntries.length || experienceKeywords.length) {
    safe.has_experience_keywords = true;
  }

  if (typeof raw.has_education_keywords === 'boolean') {
    safe.has_education_keywords = raw.has_education_keywords;
  }

  const textLength = Number(raw.text_length);
  if (Number.isFinite(textLength) && textLength >= 0) {
    safe.text_length = textLength;
  }

  return safe;
};

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

    const sanitizedExtractedInfo = sanitizeExtractedInfo(result.extracted_info);
    const extractedPersonalInfo = sanitizePersonalInfo(sanitizedExtractedInfo);
    const existingResume = await Resume.findOne({ userId: req.user._id });

    // Extract and save skills if the user is authenticated
    if (req.user && req.user._id && result.skills) {
      await saveSkillsToUser(req.user._id, result.skills);
      console.log(`Skills extracted and saved for user ${req.user._id}`);
    }

    const preferencesPayload = {
      industries: Array.isArray(result.preferences?.industries)
        ? result.preferences?.industries
        : industries,
      goals: result.preferences?.goals ?? goals,
      location: result.preferences?.location ?? location,
    };

    const extension = path.extname(req.file.originalname || '').replace('.', '').toLowerCase();
    const mimeType = req.file.mimetype || '';
    const determineFileType = () => {
      if (['pdf', 'doc', 'docx'].includes(extension)) return extension;
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.includes('wordprocessingml')) return 'docx';
      if (mimeType.includes('msword')) return 'doc';
      return 'pdf';
    };

    const updatePayload = {
      userId: req.user._id,
      summary: result.summary,
      preferences: preferencesPayload,
      extractedInfo: sanitizedExtractedInfo,
      aiInsights: result.ai_insights ?? {},
      fileInfo: {
        path: resumePath,
        type: determineFileType(),
        originalName: req.file.originalname,
        size: req.file.size,
        uploadDate: new Date(),
      },
    };

    const sanitizedStoredInfo = sanitizePersonalInfo(existingResume?.personalInfo);
    if (Object.keys(extractedPersonalInfo).length) {
      updatePayload.personalInfo = extractedPersonalInfo;
    } else if (Object.keys(sanitizedStoredInfo).length) {
      updatePayload.personalInfo = sanitizedStoredInfo;
    } else if (existingResume?.personalInfo && Object.keys(existingResume.personalInfo).length) {
      updatePayload.personalInfo = {};
    }

    const savedResume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      updatePayload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    result.preferences = preferencesPayload;
    const persistedPersonalInfo = sanitizePersonalInfo(savedResume?.personalInfo);
    const responseExtractedInfo = {
      ...sanitizedExtractedInfo,
      ...persistedPersonalInfo,
    };

    // Keep full_name in response if available for UI display
    if (sanitizedExtractedInfo.full_name && !responseExtractedInfo.name) {
      responseExtractedInfo.name = sanitizedExtractedInfo.full_name;
    }

    result.extracted_info = responseExtractedInfo;
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

exports.getLatestResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const sanitizedExtractedInfo = sanitizeExtractedInfo(resume.extractedInfo);
    const personalInfo = sanitizePersonalInfo(resume.personalInfo);
    const extractedInfoResponse = {
      ...sanitizedExtractedInfo,
      ...personalInfo,
    };

    if (sanitizedExtractedInfo.full_name && !extractedInfoResponse.name) {
      extractedInfoResponse.name = sanitizedExtractedInfo.full_name;
    }

    res.json({
      summary: resume.summary ?? '',
      extracted_info: extractedInfoResponse,
      preferences: resume.preferences ?? {},
      ai_insights: resume.aiInsights ?? {},
    });
  } catch (error) {
    console.error('Error fetching latest resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

exports.finalizeResume = async (req, res) => {
  try {
    const { personalInfo = {}, preferences = {}, sections = {} } = req.body;

    const resume = await Resume.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (!resume.fileInfo?.path) {
      return res.status(400).json({ error: 'Resume file is missing. Please upload again.' });
    }

    const normalizedPreferences = {
      industries: Array.isArray(preferences.industries)
        ? sanitizeArrayOfStrings(preferences.industries)
        : [],
      goals: sanitizeString(preferences.goals) ?? '',
      location:
        sanitizeString(preferences.location) ??
        sanitizeString(resume.preferences?.location) ??
        '',
    };

    const sanitizedPersonalInfo = sanitizePersonalInfo(personalInfo);
    if (Object.keys(sanitizedPersonalInfo).length) {
      resume.personalInfo = sanitizedPersonalInfo;
    } else {
      resume.personalInfo = sanitizePersonalInfo(resume.personalInfo);
    }

    const sectionUpdates = {
      technicalSkills: sanitizeArrayOfStrings(sections.technicalSkills),
      experienceEntries: sanitizeArrayOfStrings(sections.experienceEntries),
      projectEntries: sanitizeArrayOfStrings(sections.projectEntries),
    };

    const analysis = await sendToPythonLLM({
      filePath: resume.fileInfo.path,
      industries: normalizedPreferences.industries,
      goals: normalizedPreferences.goals,
      location: normalizedPreferences.location,
    });

    if (req.user && req.user._id && analysis.skills) {
      await saveSkillsToUser(req.user._id, analysis.skills);
    }

    const sanitizedAnalysisInfo = sanitizeExtractedInfo(analysis.extracted_info);

    if (sectionUpdates.technicalSkills.length) {
      sanitizedAnalysisInfo.detected_skills = sectionUpdates.technicalSkills;
      sanitizedAnalysisInfo.total_skills_found = sectionUpdates.technicalSkills.length;
    }

    if (sectionUpdates.experienceEntries.length) {
      sanitizedAnalysisInfo.experience_entries = sectionUpdates.experienceEntries;
      sanitizedAnalysisInfo.has_experience_keywords = true;
    }

    if (sectionUpdates.projectEntries.length) {
      sanitizedAnalysisInfo.project_entries = sectionUpdates.projectEntries;
    }

    const personalInfoForExtraction = sanitizePersonalInfo(resume.personalInfo);
    const mergedExtractedInfo = {
      ...sanitizedAnalysisInfo,
      ...personalInfoForExtraction,
    };

    if (sanitizedAnalysisInfo.full_name && !mergedExtractedInfo.name) {
      mergedExtractedInfo.name = sanitizedAnalysisInfo.full_name;
    }

    resume.summary = analysis.summary;
    resume.preferences = normalizedPreferences;
    resume.extractedInfo = mergedExtractedInfo;
    resume.aiInsights = analysis.ai_insights ?? {};
    await resume.save();

    const responsePayload = {
      summary: resume.summary ?? '',
      extracted_info: mergedExtractedInfo,
      preferences: resume.preferences ?? {},
      ai_insights: resume.aiInsights ?? {},
    };

    res.json(responsePayload);
  } catch (error) {
    console.error('Error finalizing resume:', error);
    res.status(500).json({ error: 'Failed to finalize resume' });
  }
};
