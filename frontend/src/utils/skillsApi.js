import { getUserFromStorage } from './api';

const PYTHON_API_BASE_URL = 'http://127.0.0.1:5000';
const NODE_API_BASE_URL = 'http://localhost:3000/api';

/**
 * Extract skills from a resume file
 * @param {File} file - Resume file (PDF/DOC)
 * @returns {Promise<Object>} Extracted skills data
 */
export async function extractSkillsFromResume(file) {
  try {
    if (!file) throw new Error('No file provided');
    
    const formData = new FormData();
    formData.append('resume', file);

  const response = await fetch(`${PYTHON_API_BASE_URL}/extract-skills`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Skills extraction failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
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
export async function saveExtractedSkills(skills) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    const selectedSkills = skills.filter(skill => skill.selected);

    const response = await fetch(`${NODE_API_BASE_URL}/users/skills/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`
      },
      body: JSON.stringify({
        skills: selectedSkills.map(skill => ({
          name: skill.name,
          level: (skill.level || 'intermediate').toLowerCase(),
          type: skill.type?.toLowerCase() === 'soft' ? 'soft' : 'technical',
          verified: typeof skill.verified === 'boolean' ? skill.verified : true
        }))
      })
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

/**
 * Get all skills for the current user
 * @returns {Promise<Array>} User skills
 */
export async function getUserSkills() {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('Authentication required. Please log in.');
    }
    
  const response = await fetch(`${NODE_API_BASE_URL}/users/skills`, {
      headers: {
        'Authorization': `Bearer ${userInfo.token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch skills: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
}

/**
 * Add a new skill manually
 * @param {string} name - Name of the skill
 * @param {string} level - Skill level (beginner, intermediate, advanced, expert)
 * @param {string} type - Type of skill (technical, soft)
 * @returns {Promise<Object>} Added skill
 */
export async function addUserSkill(name, level, type) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('Authentication required. Please log in.');
    }
    
  const response = await fetch(`${NODE_API_BASE_URL}/users/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`
      },
      body: JSON.stringify({ name, level, type })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to add skill: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding skill:', error);
    throw error;
  }
}

/**
 * Update an existing skill
 * @param {string} skillId - ID of skill to update
 * @param {string} name - Updated skill name
 * @param {string} level - Updated skill level
 * @param {string} type - Type of skill (technical, soft)
 * @returns {Promise<Object>} Updated skill
 */
export async function updateUserSkill(skillId, name, level, type) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('Authentication required. Please log in.');
    }
    
  const response = await fetch(`${NODE_API_BASE_URL}/users/skills/${skillId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`
      },
      body: JSON.stringify({ name, level, type })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update skill: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating skill:', error);
    throw error;
  }
}

/**
 * Delete a skill
 * @param {string} skillId - ID of skill to delete
 * @param {string} type - Type of skill (technical, soft)
 * @returns {Promise<Object>} Result of delete operation
 */
export async function deleteUserSkill(skillId, type) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('Authentication required. Please log in.');
    }
    
    const response = await fetch(`${NODE_API_BASE_URL}/users/skills/${skillId}?type=${encodeURIComponent(type)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userInfo.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete skill: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting skill:', error);
    throw error;
  }
}