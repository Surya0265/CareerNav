import { getUserFromStorage } from './api';

const API_BASE_URL = 'http://localhost:3000/api';

// Skills API functions
export async function getUserSkills() {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/users/skills`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user skills');
    }
    
    return data;
  } catch (error: any) {
    console.error('Get skills error:', error);
    throw error;
  }
}

export async function addUserSkill(name: string, level: string, type: string) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/users/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
      },
      body: JSON.stringify({ name, level, type }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add skill');
    }
    
    return data;
  } catch (error: any) {
    console.error('Add skill error:', error);
    throw error;
  }
}

export async function updateUserSkill(skillId: string, name: string, level: string, type: string) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/users/skills/${skillId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
      },
      body: JSON.stringify({ name, level, type }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update skill');
    }
    
    return data;
  } catch (error: any) {
    console.error('Update skill error:', error);
    throw error;
  }
}

export async function deleteUserSkill(skillId: string, type: string) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/users/skills/${skillId}?type=${type}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete skill');
    }
    
    return data;
  } catch (error: any) {
    console.error('Delete skill error:', error);
    throw error;
  }
}