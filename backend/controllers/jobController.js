require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

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

// Controller to fetch jobs using skills extracted by Python backend
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
  const fs = require('fs');
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
