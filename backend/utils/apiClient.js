// utils/apiClient.js
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

exports.sendToPythonLLM = async ({ filePath, fileData, fileName = 'resume.pdf', industries, goals, location }) => {
  const form = new FormData();
  
  // Support both file path and buffer data
  if (fileData) {
    // Convert buffer to stream
    const stream = Readable.from([fileData]);
    form.append('resume', stream, fileName);
  } else if (filePath) {
    form.append('resume', fs.createReadStream(filePath));
  } else {
    throw new Error('Either filePath or fileData must be provided');
  }
  
  form.append('industries', JSON.stringify(industries));
  form.append('goals', goals);
  form.append('location', location);

  const response = await axios.post('http://127.0.0.1:5000/process', form, {
    headers: form.getHeaders(),
  });

  return response.data;
};
