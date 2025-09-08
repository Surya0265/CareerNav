const { spawn } = require('child_process');
const path = require('path');

// Controller to generate career timeline using Python script
exports.generateCareerTimeline = async (req, res) => {
  try {
    const { current_skills, target_job, timeframe_months, additional_context } = req.body;
    if (!current_skills || !target_job || !timeframe_months) {
      return res.status(400).json({ error: 'current_skills, target_job, and timeframe_months are required' });
    }

    // Prepare arguments for Python script
    const args = [
      JSON.stringify(current_skills),
      target_job,
      timeframe_months.toString(),
      additional_context ? JSON.stringify(additional_context) : '{}'
    ];

    const py = spawn('python', ['utils/gemini_timeline.py', ...args]);
    let data = '';
    let error = '';

    py.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    py.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });
    py.on('close', (code) => {
      if (code !== 0 || error) {
        return res.status(500).json({ error: error || 'Failed to generate timeline' });
      }
      try {
        const result = JSON.parse(data);
        // Always include the mermaid_chart in the response if present
        res.json(result);
      } catch (e) {
        res.status(500).json({ error: 'Invalid response from timeline generator' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Controller to generate a career plan with Mermaid flowchart
exports.generateCareerPlan = async (req, res) => {
  try {
    const { current_skills, target_job, timeframe_months } = req.body;
    
    if (!current_skills || !target_job || !timeframe_months) {
      return res.status(400).json({ error: 'current_skills, target_job, and timeframe_months are required' });
    }

    // Prepare arguments for Python script
    const args = [
      JSON.stringify(current_skills),
      target_job,
      timeframe_months.toString()
    ];

    // Spawn the Python process
    const py = spawn('python', ['utils/gemini_plan.py', ...args]);
    let data = '';
    let error = '';

    py.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    py.stderr.on('data', (chunk) => {
      // Log stderr output but don't treat it as a fatal error
      // This allows us to separate logging (now to stderr) from JSON data (to stdout)
      console.log(`gemini_plan.py log: ${chunk.toString().trim()}`);
      
      // If it contains an actual error that would prevent execution, add it to error string
      if (chunk.toString().toLowerCase().includes('error:') || chunk.toString().toLowerCase().includes('exception:')) {
        error += chunk.toString();
      }
    });
    
    py.on('close', (code) => {
      // Check for gRPC timeout error and ignore it if data was successfully returned
      const isGrpcTimeoutError = error.includes('grpc_wait_for_shutdown_with_timeout() timed out');
      
      if ((code !== 0 || error) && !(isGrpcTimeoutError && data)) {
        console.error(`Error running gemini_plan.py: ${error}`);
        return res.status(500).json({ error: error || 'Failed to generate career plan' });
      }
      
      try {
        // Only log raw data when troubleshooting
        // console.log("Raw data from Python script:", data);
        
        // Try to parse the JSON response
        const result = JSON.parse(data);
        
        if (result.error) {
          return res.status(500).json({ error: result.error });
        }
        
        // Check if required fields exist
        if (!result.plan || !result.mermaid_code) {
          console.error("Missing required fields in response:", result);
          return res.status(500).json({ error: 'Incomplete response from plan generator' });
        }
        
        res.json({
          plan: result.plan,
          mermaid_code: result.mermaid_code,
          full_response: result.full_response
        });
      } catch (e) {
        console.error(`Error parsing JSON from Python: ${e}`);
        console.error(`Data received: ${data}`);
        res.status(500).json({ error: 'Invalid response from plan generator' });
      }
    });
  } catch (err) {
    console.error(`General error in generateCareerPlan: ${err}`);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
