// Simple test script for existing skills endpoint
// Run with: node test_existing_skills.js

const axios = require('axios');

// Replace these with actual values
const TEST_TOKEN = 'your_jwt_token_here';
const BASE_URL = 'http://localhost:3011';

async function testExistingSkills() {
  try {
    console.log('Testing /api/jobs/jobs-by-skills endpoint...\n');
    
    const payload = {
      city: 'New York',
      country: 'us'
    };
    
    console.log('Request payload:', payload);
    console.log('Auth header: Bearer ' + TEST_TOKEN.substring(0, 20) + '...\n');
    
    const response = await axios.post(
      `${BASE_URL}/api/jobs/jobs-by-skills`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

console.log('=== Job Recommendations - Existing Skills Test ===\n');
console.log('⚠️  UPDATE TEST_TOKEN AND RUN THIS SCRIPT');
console.log('Get a JWT token by logging in first\n');

testExistingSkills();
