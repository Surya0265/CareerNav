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
    // Validate file exists
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        details: 'Please select a resume file to upload.'
      });
    }

    const resumePath = req.file.path;
    
    // Validate file size - defensive check
    if (req.file.size === 0) {
      fs.unlinkSync(resumePath);
      return res.status(400).json({
        error: 'Invalid file',
        details: 'The uploaded file is empty. Please upload a valid resume.'
      });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      fs.unlinkSync(resumePath);
      return res.status(413).json({
        error: 'File too large',
        details: 'The file exceeds the 10MB size limit.'
      });
    }

    console.log("[RESUME UPLOAD] FILE:", req.file);
    console.log("[RESUME UPLOAD] Saved file path:", req.file.path);

    // Read file into buffer
    const fileData = fs.readFileSync(resumePath);

    // Get dynamic data from frontend
    const industries = JSON.parse(req.body.industries || '[]');
    const goals = req.body.goals || '';
    const location = req.body.location || '';

    // Try to extract - wrap in try/catch for corruption detection
    let result;
    try {
      // Send the file buffer to the Python service instead of the file path.
      // The Python service will process the uploaded stream without
      // writing/deleting the same file on the shared uploads folder,
      // preventing race conditions where Python removes the file before
      // this process can clean it up.
      result = await sendToPythonLLM({
        fileData: fileData,
        fileName: req.file.originalname || path.basename(resumePath),
        industries,
        goals,
        location,
      });
      console.log('[RESUME UPLOAD] Python extraction successful (via buffer)');
    } catch (extractionError) {
      // Attempt to remove temp file if it still exists (defensive)
      try {
        if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
      } catch (e) {
        console.warn('[RESUME UPLOAD] Could not delete temp file during extraction failure:', e.message);
      }
      console.error('[RESUME UPLOAD] Python extraction failed:', extractionError.message);
      return res.status(422).json({
        error: 'Corrupted or invalid file',
        details: 'The file could not be parsed. Please ensure your resume is a valid PDF or Word document with readable text content.'
      });
    }

    // Validate extraction result
    if (!result || typeof result !== 'object') {
      fs.unlinkSync(resumePath);
      console.error('[RESUME UPLOAD] Invalid extraction result');
      return res.status(422).json({
        error: 'Processing failed',
        details: 'The file could not be processed. Please try again with a different file.'
      });
    }

    // Continue with normal processing
    const sanitizedExtractedInfo = sanitizeExtractedInfo(result.extracted_info);
    const extractedPersonalInfo = sanitizePersonalInfo(sanitizedExtractedInfo);
    const existingResume = await Resume.findOne({ userId: req.user._id });

    // Extract and save skills if the user is authenticated
    if (req.user && req.user._id && result.skills) {
      await saveSkillsToUser(req.user._id, result.skills);
      console.log(`[RESUME UPLOAD] Skills extracted and saved for user ${req.user._id}`);
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
        type: determineFileType(),
        originalName: req.file.originalname,
        size: req.file.size,
        uploadDate: new Date(),
      },
      fileData: {
        data: fileData,
        contentType: req.file.mimetype,
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
    
    // Clean up temp file
    try {
      fs.unlinkSync(resumePath);
      console.log('[RESUME UPLOAD] Temp resume file deleted:', resumePath);
    } catch (err) {
      console.warn('[RESUME UPLOAD] Could not delete temp file:', err.message);
    }
    
    console.log('[RESUME UPLOAD] Upload completed successfully for user:', req.user._id);
    res.json(result);
    
  } catch (error) {
    console.error('[RESUME UPLOAD] Resume processing error:', error.message);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('[RESUME UPLOAD] Cleaned up temp file after error');
      } catch (err) {
        console.warn('[RESUME UPLOAD] Could not delete temp file:', err.message);
      }
    }
    
    // Return error based on error type
    if (error.message && error.message.includes('Unsupported file type')) {
      return res.status(400).json({
        error: 'Invalid file type',
        details: 'Only PDF and Word documents (.pdf, .doc, .docx) are supported.'
      });
    }
    
    if (error.message && (error.message.includes('ENOENT') || error.message.includes('File not found'))) {
      return res.status(400).json({
        error: 'File error',
        details: 'The file could not be found. Please try uploading again.'
      });
    }
    
    if (error.code === 'ECONNREFUSED' || error.message && error.message.includes('network')) {
      return res.status(503).json({
        error: 'Connection failed',
        details: 'Could not connect to the processing service. Please try again later.'
      });
    }
    
    // Generic error for unexpected failures
    return res.status(500).json({
      error: 'Processing failed',
      details: 'An unexpected error occurred. Please try uploading a different file.'
    });
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
        level: 'Intermediate',
        verified: true,
        category: 'Technical'
      })) : [];
    
    const softSkills = Array.isArray(extractedSkills.soft) ? 
      extractedSkills.soft.map(skill => ({
        name: skill,
        level: 'Intermediate',
        verified: true,
        category: 'Soft'
      })) : [];
    
    // Find user and update skills directly
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found when saving skills');
      return false;
    }
    
    // Initialize skills array if it doesn't exist
    if (!Array.isArray(user.skills)) {
      user.skills = [];
    } else {
      // Clean up any invalid skills (with undefined names)
      user.skills = user.skills.filter(s => s && s.name);
    }
    
    // Add new skills, avoiding duplicates
    for (const skill of technicalSkills) {
      if (!user.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
        user.skills.push(skill);
      }
    }
    
    for (const skill of softSkills) {
      if (!user.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
        user.skills.push(skill);
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
    console.log('Finalize resume called for user:', req.user._id);
    const { personalInfo = {}, preferences = {}, sections = {} } = req.body;
    console.log('Request body:', { personalInfo, preferences, sections });

    const resume = await Resume.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });

    if (!resume) {
      console.log('No resume found for user:', req.user._id);
      return res.status(404).json({ error: 'Resume not found' });
    }

    console.log('Resume found:', resume._id, 'File path:', resume.fileInfo?.path);

    // Check if file data exists in MongoDB
    if (!resume.fileData || !resume.fileData.data) {
      console.log('No file data in MongoDB');
      return res.status(400).json({ error: 'Resume file not found in database. Please upload your resume again.' });
    }

    console.log('File data found in MongoDB, size:', resume.fileData.data.length);

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
      fileData: resume.fileData.data,
      fileName: resume.fileInfo.originalName || 'resume.pdf',
      industries: normalizedPreferences.industries,
      goals: normalizedPreferences.goals,
      location: normalizedPreferences.location,
    });

    console.log('Analysis response:', { 
      hasExtractedInfo: !!analysis.extracted_info,
      hasDetectedSkills: !!analysis.extracted_info?.detected_skills,
      skillsCount: analysis.extracted_info?.detected_skills?.length || 0,
      hasAiInsights: !!analysis.ai_insights,
      aiInsightsKeys: analysis.ai_insights ? Object.keys(analysis.ai_insights) : [],
      careerRecsCount: analysis.ai_insights?.career_recommendations?.recommended_roles?.length || 0
    });

    // Format skills for saveSkillsToUser function
    if (req.user && req.user._id && analysis.extracted_info && analysis.extracted_info.detected_skills) {
      const skillsByCategory = analysis.extracted_info.skills_by_category || {};
      const formattedSkills = {
        technical: skillsByCategory.technical_skills || skillsByCategory.technical || analysis.extracted_info.detected_skills,
        soft: skillsByCategory.soft_skills || skillsByCategory.soft || []
      };
      console.log('Saving formatted skills:', { 
        technicalCount: formattedSkills.technical?.length || 0,
        softCount: formattedSkills.soft?.length || 0 
      });
      await saveSkillsToUser(req.user._id, formattedSkills);
    }

    const sanitizedAnalysisInfo = sanitizeExtractedInfo(analysis.extracted_info);

    console.log('Sanitized analysis info:', {
      hasDetectedSkills: !!sanitizedAnalysisInfo.detected_skills,
      detectedSkillsCount: sanitizedAnalysisInfo.detected_skills?.length || 0,
      hasExperienceEntries: !!sanitizedAnalysisInfo.experience_entries,
      experienceEntriesCount: sanitizedAnalysisInfo.experience_entries?.length || 0
    });

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

    console.log('Finalize response being sent to frontend:', {
      hasAiInsights: !!responsePayload.ai_insights,
      aiInsightsKeys: Object.keys(responsePayload.ai_insights || {}),
      careerRecsCount: responsePayload.ai_insights?.career_recommendations?.recommended_roles?.length || 0
    });

    res.json(responsePayload);
  } catch (error) {
    console.error('Error finalizing resume:', error.message || error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to finalize resume',
      details: error.message || error,
      timestamp: new Date().toISOString()
    });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ userId: req.user._id });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // File data is automatically deleted from MongoDB with the resume record
    console.log('Resume deleted from database:', resume._id);

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
};

// Migration: Clean up old resume records without fileData
exports.cleanupOldResumes = async (req, res) => {
  try {
    const result = await Resume.deleteMany({ 
      fileData: { $exists: false } 
    });
    
    console.log(`Cleaned up ${result.deletedCount} old resume records without fileData`);
    res.json({ 
      message: 'Cleanup completed',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up old resumes:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
};
