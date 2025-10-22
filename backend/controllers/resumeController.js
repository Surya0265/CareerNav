const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { sendToPythonLLM } = require('../utils/apiClient');
const User = require('../models/User');
const Resume = require('../models/Resume');
const LearningResource = require('../models/LearningResource');

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
    
    // Enrich learning phases with free course suggestions stored in Mongo
    try {
      console.log('[RESUME UPLOAD] Checking for phases to attach resources...');
      console.log('[RESUME UPLOAD] result.ai_insights structure:', {
        hasAiInsights: !!result.ai_insights,
        aiInsightsKeys: result.ai_insights ? Object.keys(result.ai_insights) : [],
        hasLearningPath: !!result.ai_insights?.learning_path,
        learningPathType: typeof result.ai_insights?.learning_path,
        learningPathKeys: result.ai_insights?.learning_path ? Object.keys(result.ai_insights.learning_path) : []
      });
      
      // Check for learning_path at two possible locations
      let phases = null;
      if (result.ai_insights?.learning_path?.phases) {
        phases = result.ai_insights.learning_path.phases;
        console.log('[RESUME UPLOAD] Found phases at learning_path.phases');
      } else if (result.ai_insights?.learning_path?.learning_path?.phases) {
        phases = result.ai_insights.learning_path.learning_path.phases;
        console.log('[RESUME UPLOAD] Found phases at learning_path.learning_path.phases');
      }
      
      console.log('[RESUME UPLOAD] Phases check result:', {
        phasesFound: !!phases,
        isArray: Array.isArray(phases),
        length: phases?.length
      });
      
      if (phases && Array.isArray(phases) && phases.length > 0) {
        console.log('[RESUME UPLOAD] Attaching resources to', phases.length, 'phases');
        // Attach free courses for each phase (will upsert curated ones if DB missing)
        await attachFreeCoursesToPhases(phases);
        
        // Store back in result - update both possible locations
        if (result.ai_insights?.learning_path?.phases) {
          result.ai_insights.learning_path.phases = phases;
        } else if (result.ai_insights?.learning_path?.learning_path?.phases) {
          result.ai_insights.learning_path.learning_path.phases = phases;
        }
        
        console.log('[RESUME UPLOAD] After attachment:', {
          phasesCount: phases.length,
          firstPhaseResources: phases[0]?.resources?.length
        });
      } else {
        console.log('[RESUME UPLOAD] No phases found to attach resources to');
      }
      
      // Prepare the update payload
      const updatePayload = { aiInsights: result.ai_insights };
      
      // Also persist the enriched aiInsights back to the database
      const updatedResume = await Resume.findOneAndUpdate(
        { userId: req.user._id },
        updatePayload,
        { new: true }
      );
      
      console.log('[RESUME UPLOAD] Enriched learning resources persisted to database');
    } catch (attachErr) {
      console.warn('[RESUME UPLOAD] Could not attach learning resources to phases:', attachErr.message, attachErr.stack);
    }

    // Clean up temp file
    try {
      fs.unlinkSync(resumePath);
      console.log('[RESUME UPLOAD] Temp resume file deleted:', resumePath);
    } catch (err) {
      console.warn('[RESUME UPLOAD] Could not delete temp file:', err.message);
    }
    
    console.log('[RESUME UPLOAD] Upload completed successfully for user:', req.user._id);
    console.log('[RESUME UPLOAD] Response about to send:', { 
      hasAiInsights: !!result.ai_insights,
      hasLearningPath: !!result.ai_insights?.learning_path?.learning_path,
      phasesCount: result.ai_insights?.learning_path?.learning_path?.phases?.length || 0
    });
    
    // Debug: show first phase resources
    if (result.ai_insights?.learning_path?.learning_path?.phases?.length > 0) {
      const firstPhase = result.ai_insights.learning_path.learning_path.phases[0];
      console.log('[RESUME UPLOAD] First phase in response:', {
        title: firstPhase.title,
        resourcesCount: firstPhase.resources?.length || 0,
        firstResource: firstPhase.resources?.[0],
        allResources: firstPhase.resources
      });
    }
    
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

/**
 * Find or create curated free courses for each phase and attach to the phase.resources array.
 * The function mutates the phases array in-place.
 */
async function attachFreeCoursesToPhases(phases = []) {
  if (!Array.isArray(phases) || phases.length === 0) {
    console.log('[ATTACH] Early return: not an array or empty', { isArray: Array.isArray(phases), length: phases.length });
    return;
  }

  console.log('[ATTACH] Starting attachFreeCoursesToPhases with', phases.length, 'phases');

  // A small curated mapping of keywords -> free course suggestions
  const curatedLinks = {
    'Introduction to Linux': 'https://www.linux.com/training-tutorials/introduction-linux-free-course/',
    'Linux for Beginners': 'https://www.edx.org/course/introduction-to-linux',
    'Bash Scripting Tutorial': 'https://www.udemy.com/course/bash-scripting/',
    'Introduction to Networking': 'https://www.coursera.org/learn/computer-networking',
    'Networking Basics': 'https://www.khanacademy.org/computing/internet-101',
    'AWS Cloud Practitioner Essentials': 'https://www.aws.amazon.com/training/free-academy-cloud-practitioner/',
    'Azure Fundamentals': 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
    'Google Cloud Platform Fundamentals: Core Infrastructure': 'https://www.cloudskillsboost.google/course/gcp-fundamentals-core-infrastructure',
    'Jenkins Handbook': 'https://www.jenkins.io/doc/',
    'GitLab CI/CD Tutorials': 'https://docs.gitlab.com/ee/ci/tutorials/',
    'Prometheus and Grafana Fundamentals': 'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
    'Terraform Associate Certification Prep': 'https://www.hashicorp.com/certification/terraform-associate',
    'Automating Infrastructure with Terraform on Google Cloud': 'https://www.cloudskillsboost.google/course/automating-infrastructure-terraform-google-cloud',
    'Introduction to DevOps Practices and Principles': 'https://www.coursera.org/learn/intro-to-devops',
    'Continuous Delivery & DevOps': 'https://www.edx.org/course/continuous-delivery-devops-what-to-measure',
    'Ansible for Beginners': 'https://www.youtube.com/playlist?list=PLT98CqLarHdWcjIvIYAeaYEQMJnTLKe1p',
    'Microsoft Azure Fundamentals AZ-900': 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/'
  };

  for (const phase of phases) {
    try {
      console.log('[ATTACH] Processing phase:', { title: phase.title });

      if (!Array.isArray(phase.resources)) {
        phase.resources = [];
      }

      // Enhance existing resources with links
      for (let i = 0; i < phase.resources.length; i++) {
        const resource = phase.resources[i];
        
        // If resource already has a link, skip it
        if (resource.link || resource.externalLink) {
          console.log('[ATTACH] Resource already has link:', resource.name);
          continue;
        }
        
        // Try to find a matching link for this resource
        const resourceName = resource.name || resource.title;
        const matchedLink = curatedLinks[resourceName];
        
        if (matchedLink) {
          // Add the link to the existing resource
          resource.link = matchedLink;
          console.log('[ATTACH] Added link to resource:', { 
            name: resourceName, 
            link: matchedLink 
          });
        } else {
          console.log('[ATTACH] No link found for resource:', resourceName);
        }
      }
      
      console.log('[ATTACH] Phase resources after enrichment:', { 
        count: phase.resources.length,
        withLinks: phase.resources.filter(r => r.link).length
      });
    } catch (err) {
      console.warn('[ATTACH] Error processing phase', phase && (phase.title || phase.phase_number), err.message);
    }
  }
  
  console.log('[ATTACH] Completed attachFreeCoursesToPhases');
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

    // Debug: log learning resources
    let phases = null;
    if (resume.aiInsights?.learning_path?.phases) {
      phases = resume.aiInsights.learning_path.phases;
      console.log('[GET LATEST RESUME] Found phases at learning_path.phases');
    } else if (resume.aiInsights?.learning_path?.learning_path?.phases) {
      phases = resume.aiInsights.learning_path.learning_path.phases;
      console.log('[GET LATEST RESUME] Found phases at learning_path.learning_path.phases');
    }
    
    // Enrich phases with links before sending to frontend
    if (phases && Array.isArray(phases)) {
      console.log('[GET LATEST RESUME] Enriching', phases.length, 'phases with links');
      await attachFreeCoursesToPhases(phases);
    }
    
    if (phases && phases.length > 0) {
      console.log('[GET LATEST RESUME] First phase resources after enrichment:', {
        count: phases[0].resources?.length,
        sample: phases[0].resources?.slice(0, 2)
      });
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
