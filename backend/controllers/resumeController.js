const path = require('path');
const fs = require('fs');
const { sendToPythonLLM } = require('../utils/apiClient');

exports.handleResumeUpload = async (req, res) => {
  try {
    const resumePath = req.file.path;
    console.log("FILE:", req.file);

    console.log("Saved file path:", req.file.path);

    // Get dynamic data from frontend
    const industries = JSON.parse(req.body.industries || '[]');
    const goals = req.body.goals || '';
    const location = req.body.location || '';

    const result = await sendToPythonLLM({
      filePath: resumePath,
      industries,
      goals,
      location,
    });

   // fs.unlinkSync(resumePath); // Cleanup
    res.json(result);
  } catch (error) {
    console.error('Resume processing error:', error.message);
    res.status(500).json({ error: 'Processing failed' });
  }
};
