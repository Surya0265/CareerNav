// Point directly to the backend server URL
const API_BASE_URL = 'http://localhost:3000';

// Authentication API endpoints
export async function loginUser(email: string, password: string) {
  try {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Save user data to localStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
    
    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function signupUser(name: string, email: string, password: string) {
  try {
  const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    
    // Save user data to localStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
    
    return data;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw error;
  }
}

export function getUserFromStorage() {
  const userJson = localStorage.getItem('userInfo');
  return userJson ? JSON.parse(userJson) : null;
}

export function logoutUser() {
  localStorage.removeItem('userInfo');
}

// Get user profile
export async function getUserProfile() {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch user profile');
    }
    
    return data;
  } catch (error: any) {
    console.error('Get profile error:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(userData: any) {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user profile');
    }
    
    // Update the stored user info with new data
    const updatedUserInfo = { ...userInfo, ...data };
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    
    return data;
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw error;
  }
}

// Get user skills
export async function getUserSkills() {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/skills`, {
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

// Delete all user skills
export async function deleteAllUserSkills() {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/skills`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user skills');
    }
    
    return data;
  } catch (error: any) {
    console.error('Delete skills error:', error);
    throw error;
  }
}

// Delete user resume
export async function deleteUserResume() {
  try {
    const userInfo = getUserFromStorage();
    
    if (!userInfo || !userInfo.token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/resume`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userInfo.token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user resume');
    }
    
    return data;
  } catch (error: any) {
    console.error('Delete resume error:', error);
    throw error;
  }
}