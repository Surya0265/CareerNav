import { getUserFromStorage } from './api';

const PYTHON_API_BASE_URL = 'http://127.0.0.1:5000';
const NODE_API_BASE_URL = 'http://localhost:3000/api';

/**
 * Extract skills from a resume file
 * @param {File} file - Resume file (PDF/DOC)
 * @returns {Promise<{skills: Array<{name: string, level: string, type: string}>}>} Extracted skills data
 */
export async function extractSkillsFromResume(file: File) {
  try {
    if (!file) throw new Error('No file provided');
    
    const formData = new FormData();
    formData.append('resume', file);
    
    // Add timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
    
    try {
  const response = await fetch(`${PYTHON_API_BASE_URL}/extract-skills`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      }).catch(err => {
        if (err.name === 'AbortError') {
          throw new Error('Skills extraction timed out. Please ensure the Python server is running.');
        } else {
          throw new Error(`Connection error: ${err.message}. Please check if the Python server is running.`);
        }
      });
      
      // Clear timeout once request completes
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Skills extraction failed with status ${response.status}`);
        } else {
          throw new Error(`Server error (${response.status}): Please check if the Python server is running`);
        }
      }
      
      const data = await response.json();
      return data;
    } catch (fetchError) {
      throw fetchError;
    }
  } catch (error) {
    console.error('Error extracting skills:', error);
    throw error;
  }
}

/**
 * Save extracted skills to user profile
 * @param {Array} skills - Array of skills to save
 * @returns {Promise<Object>} Result of save operation
 */
export async function saveExtractedSkills(skills: Array<{
  name: string;
  level?: string;
  type: string;
  selected: boolean;
  verified?: boolean;
  category?: string;
}>) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    const selectedSkills = skills
      .filter(skill => skill.selected)
      .map(skill => ({
        name: skill.name,
        level: (skill.level || 'intermediate').toLowerCase(),
        type: skill.type?.toLowerCase() === 'soft' ? 'soft' : 'technical',
        verified: true
      }));

    const response = await fetch(`${NODE_API_BASE_URL}/users/skills/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`
      },
      body: JSON.stringify({ skills: selectedSkills })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to save skills: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving skills:', error);
    throw error;
  }
}