// utils/apiClient.js
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

exports.sendToPythonLLM = async ({ filePath, industries, goals, location }) => {
  const form = new FormData();
  form.append('resume', fs.createReadStream(filePath));
  form.append('industries', JSON.stringify(industries));
  form.append('goals', goals);
  form.append('location', location);

  const response = await axios.post('http://127.0.0.1:5000/process', form, {
    headers: form.getHeaders(),
  });

  return response.data;
};
