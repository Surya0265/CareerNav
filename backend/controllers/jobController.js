require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const User = require('../models/User');
const Resume = require('../models/Resume');

// Fetch jobs from API
async function fetchJobs(query, city, country = 'us') {
  try {
    const url = 'https://jsearch.p.rapidapi.com/search';
    const options = {
      params: {
        query: query,
        page: '1',
        num_pages: '3',
        country,
        date_posted: 'all',
        city: city
      },
      headers: {
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
    };
    const response = await axios.get(url, options);
    return response.data.data || [];
  } catch (err) {
    console.error('Error fetching jobs:', err.response?.data || err.message);
    return [];
  }
}

// Helper function to extract skills from resume and save to DB
async function extractAndSaveSkills(resumePath, userId) {
  try {
    const form = new FormData();
    form.append('resume', fs.createReadStream(resumePath));
    
    const extractResponse = await axios.post('http://127.0.0.1:5000/extract-resume', form, {
      headers: form.getHeaders(),
    });
    
    const extractedSkills = extractResponse.data?.extracted_content?.basic_info?.skills || [];
    const skillsByCategory = extractResponse.data?.extracted_content?.skills_by_category || {};
    
    // Save to User model
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        skills: {
          technical: extractedSkills,
          categories: skillsByCategory
        }
      });
    }
    
    return extractedSkills;
  } catch (err) {
    console.error('Error extracting skills:', err.message);
    return [];
  }
}

// Helper function to extract jobs based on skills
async function extractJobsForSkills(skills, city, country) {
  let allJobs = [];
  let seenTitles = new Set();
  
  // Try searching for each skill individually
  for (const skill of skills) {
    const jobs = await fetchJobs(`${skill} jobs`, city, country);
    for (const job of jobs) {
      if (!seenTitles.has(job.job_title)) {
        seenTitles.add(job.job_title);
        allJobs.push({
          title: job.job_title,
          company: job.employer_name,
          location: `${job.job_city}, ${job.job_country}`,
          salary: job.job_salary ?? 'Not specified',
          applyLink: job.job_apply_link,
        });
      }
      if (allJobs.length >= 30) break;
    }
    if (allJobs.length >= 30) break;
  }
  
  // Fallback: if still no jobs found, try a generic query
  if (allJobs.length === 0) {
    const jobs = await fetchJobs('developer jobs', city, country);
    for (const job of jobs) {
      if (!seenTitles.has(job.job_title)) {
        seenTitles.add(job.job_title);
        allJobs.push({
          title: job.job_title,
          company: job.employer_name,
          location: `${job.job_city}, ${job.job_country}`,
          salary: job.job_salary ?? 'Not specified',
          applyLink: job.job_apply_link,
        });
      }
      if (allJobs.length >= 30) break;
    }
  }
  
  return allJobs;
}

// NEW: Upload new resume and get job recommendations (updates DB)
exports.getJobsByUploadedResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }
    
    const city = req.body.city;
    const country = req.body.country || 'us';
    
    if (!city || !country) {
      return res.status(400).json({ error: 'city and country are required' });
    }
    
    // Extract skills from resume
    const form = new FormData();
    form.append('resume', fs.createReadStream(req.file.path));
    
    const extractResponse = await axios.post('http://127.0.0.1:5000/extract-resume', form, {
      headers: form.getHeaders(),
    });
    
    const skills = extractResponse.data?.extracted_content?.basic_info?.skills || [];
    const skillsByCategory = extractResponse.data?.extracted_content?.skills_by_category || {};
    
    // Convert skills to the correct format: array of objects with name, level, category
    const formattedSkills = Array.isArray(skills) 
      ? skills.map(skill => ({
          name: typeof skill === 'string' ? skill : skill.name || skill,
          level: skill.level || 'Intermediate',
          verified: false,
          category: skill.category || skillsByCategory[skill] || 'Technical'
        }))
      : [];
    
    // Save skills to authenticated user if available
    if (req.user && req.user._id) {
      await User.findByIdAndUpdate(req.user._id, {
        skills: formattedSkills
      });
      
      // Also save to Resume if it exists
      const userResume = await Resume.findOne({ userId: req.user._id });
      if (userResume) {
        userResume.skills = formattedSkills;
        await userResume.save();
      }
    }
    
    // Extract skill names for job search
    const skillNames = formattedSkills.map(skill => skill.name);
    
    // Fetch jobs based on extracted skills
    const allJobs = await extractJobsForSkills(skillNames, city, country);
    
    res.json({ 
      skills: skillNames, 
      jobs: allJobs,
      message: allJobs.length === 0 ? 'No jobs found for your profile/location.' : 'Jobs found successfully'
    });
  } catch (err) {
    console.error('Job search controller error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// NEW: Get jobs by existing skills stored in DB (no file upload)
exports.getJobsByExistingSkills = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error('No user in request');
      return res.status(401).json({ 
        error: 'Unauthorized. Please login first.' 
      });
    }
    
    console.log('Request body:', req.body);
    console.log('User:', req.user._id);
    
    const city = req.body?.city;
    const country = req.body?.country || 'us';
    
    console.log('City:', city, 'Country:', country);
    
    if (!city) {
      return res.status(400).json({ error: 'city is required' });
    }
    
    // Get skills from authenticated user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }
    
    console.log('User skills:', user.skills);
    
    if (!user.skills || !Array.isArray(user.skills) || user.skills.length === 0) {
      return res.status(400).json({ 
        error: 'No skills found. Please upload your resume first.' 
      });
    }
    
    // Extract skill names from the skills array
    // Skills are stored as: [{ name: "CSS", level: "...", verified: true, category: "..." }, ...]
    const skills = user.skills.map(skill => skill.name || skill);
    
    console.log(`Fetching jobs for user ${req.user._id} with skills: ${skills.join(', ')}`);
    
    // Fetch jobs based on existing skills
    const allJobs = await extractJobsForSkills(skills, city, country);
    
    res.json({ 
      skills, 
      jobs: allJobs,
      message: allJobs.length === 0 ? 'No jobs found for your profile/location.' : 'Jobs found successfully'
    });
  } catch (err) {
    console.error('Job search by existing skills error:', err);
    res.status(500).json({ error: 'Something went wrong: ' + err.message });
  }
};

// Controller to fetch jobs using skills extracted by Python backend (legacy)
exports.getJobsForExtractedSkills = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }
    const city = req.body.city;
    const country = req.body.country || 'us';
    if (!city || !country) {
      return res.status(400).json({ error: 'city and country are required' });
    }
    // Send resume to Python backend for extraction
    const form = new FormData();
    form.append('resume', fs.createReadStream(req.file.path));
    const extractResponse = await axios.post('http://127.0.0.1:5000/extract-resume', form, {
      headers: form.getHeaders(),
    });
    const skills = extractResponse.data?.extracted_content?.basic_info?.skills || [];
    let allJobs = [];
    let seenTitles = new Set();
    // Try searching for each skill individually
    for (const skill of skills) {
      const jobs = await fetchJobs(`${skill} jobs`, city, country);
      for (const job of jobs) {
        if (!seenTitles.has(job.job_title)) {
          seenTitles.add(job.job_title);
          allJobs.push({
            title: job.job_title,
            company: job.employer_name,
            location: `${job.job_city}, ${job.job_country}`,
            salary: job.job_salary ?? 'Not specified',
            applyLink: job.job_apply_link,
          });
        }
        if (allJobs.length >= 30) break;
      }
      if (allJobs.length >= 30) break;
    }
    // Fallback: if still no jobs found, try a generic query
    if (allJobs.length === 0) {
      const jobs = await fetchJobs('developer jobs', city, country);
      for (const job of jobs) {
        if (!seenTitles.has(job.job_title)) {
          seenTitles.add(job.job_title);
          allJobs.push({
            title: job.job_title,
            company: job.employer_name,
            location: `${job.job_city}, ${job.job_country}`,
            salary: job.job_salary ?? 'Not specified',
            applyLink: job.job_apply_link,
          });
        }
        if (allJobs.length >= 30) break;
      }
    }
    if (allJobs.length > 0) {
      res.json({ skills, jobs: allJobs });
    } else {
      res.json({ skills, message: 'No jobs found for your profile/location.' });
    }
  } catch (err) {
    console.error('Job search controller error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
