const { spawn } = require('child_process');
const path = require('path');
const TimelinePlan = require('../models/TimelinePlan');

// Helper: normalize list-like fields (arrays, newline-separated strings, comma lists, or bullet lists)
function parseList(val) {
  if (!val && val !== 0) return [];
  if (Array.isArray(val)) return val.map((s) => (s || '').toString().trim()).filter(Boolean);
  if (typeof val === 'string') {
    // split by newlines first, then commas if only one line
    let parts = val.split('\n').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 1) {
      parts = parts[0].split(',').map((s) => s.trim()).filter(Boolean);
    }
    // remove common bullet prefixes
    return parts.map((p) => p.replace(/^[-•\u2022\u2013\u2014\u2212\u25BA\u2192\u2713\u2714\u2023\s]*|^[→→]*\s*/g, '').trim()).filter(Boolean);
  }
  // fallback: convert to string
  return [String(val)].map((s) => s.trim()).filter(Boolean);
}

function normalizePhase(p, idx) {
  const title = p.title || p.name || `Phase ${idx + 1}`;
  const description = p.description || p.details || '';
  let duration_days = null;
  if (p.duration_days) duration_days = Number(p.duration_days);
  else if (p.duration_weeks) duration_days = Number(p.duration_weeks) * 7;
  else if (p.duration) {
    // try to parse values like '4 weeks' or '4 wk'
    const m = String(p.duration).match(/(\d+)\s*(week|weeks|wk|w)/i);
    if (m) duration_days = Number(m[1]) * 7;
  }

  const skills = parseList(p.skills || p.skill_list || p.skills_list || []);
  const projects = parseList(p.projects || p.project_list || []);
  const milestones = parseList(p.milestones || p.milestone_list || []);

  const duration_weeks = duration_days ? Math.round(duration_days / 7) : (p.duration_weeks ? Number(p.duration_weeks) : undefined);

  return {
    title,
    description,
    duration_days,
    duration_weeks,
    order: idx + 1,
    skills,
    projects,
    milestones,
    completed: Boolean(p.completed),
  };
}

// Controller to generate career timeline using Python script
exports.generateCareerTimeline = async (req, res) => {
  try {
    const { current_skills, target_job, timeframe_months, additional_context } = req.body;
    console.log('timelineController: generateCareerTimeline called with:', {
      current_skills,
      target_job,
      timeframe_months,
      additional_context
    });
    
    if (!current_skills || !target_job || !timeframe_months) {
      console.error('timelineController: Missing required fields');
      return res.status(400).json({ error: 'current_skills, target_job, and timeframe_months are required' });
    }

    // Prepare arguments for Python script (mode = "ai")
    const args = [
      JSON.stringify(current_skills),
      target_job,
      timeframe_months.toString(),
      additional_context ? JSON.stringify(additional_context) : '{}',
      'ai'  // mode: "ai" for Gemini-based timeline
    ];

    console.log('timelineController: Spawning Python process with args:', args);
    const py = spawn('python', ['utils/gemini_timeline.py', ...args]);
    let data = '';
    let error = '';

    py.stdout.on('data', (chunk) => {
      data += chunk.toString();
      console.log('timelineController: Python stdout:', chunk.toString());
    });
    py.stderr.on('data', (chunk) => {
      // Log stderr output but don't treat it as a fatal error
      // This allows us to separate logging from JSON data (to stdout)
      console.log(`gemini_timeline.py log: ${chunk.toString().trim()}`);
      
      // Only add to error if it's an actual error, not just a gRPC warning
      if (chunk.toString().toLowerCase().includes('error:') || chunk.toString().toLowerCase().includes('exception:')) {
        error += chunk.toString();
      }
    });
  py.on('close', async (code) => {
      console.log('timelineController: Python process closed with code:', code, 'error:', error, 'data length:', data.length);
      
      // Check for gRPC timeout error and ignore it if data was successfully returned
      const isGrpcTimeoutError = error.includes('grpc_wait_for_shutdown_with_timeout() timed out');
      
      if ((code !== 0 || error) && !(isGrpcTimeoutError && data)) {
        console.error('timelineController: Error detected - code:', code, 'error:', error);
        return res.status(500).json({ error: error || 'Failed to generate timeline' });
      }
      try {
        const result = JSON.parse(data);
        console.log('timelineController: Successfully parsed result');

        // Log raw Python script output for debugging
        console.log('timelineController: Raw Python script output:', data);

        // Use `result.timeline` as a fallback for `result.plan`
        const planData = result.plan || result.timeline;

        // Validate and normalize the plan
        let phases = [];
        if (Array.isArray(planData)) {
          phases = planData.map((p, idx) => normalizePhase(p, idx));
        } else {
          console.warn('timelineController: No valid plan or timeline data returned from Python script');
        }

        // Compute summary metadata
        const phase_count = phases.length;
        const approx_months = phase_count > 0
          ? Math.round(phases.reduce((sum, p) => sum + (p.duration_weeks || 0), 0) / 4.33)
          : timeframe_months;

        // Persist the generated timeline
        try {
          const created = await TimelinePlan.create({
            user: req.user?._id,
            current_skills,
            target_job,
            timeframe_months,
            additional_context,
            mermaid_code: result.mermaid_chart || result.mermaid_code || result.mermaid || '',
            phases,
            phase_count,
            approx_months,
          });

          // Attach created plan ID back onto the result
          if (created && created._id) {
            result.plan_id = created._id.toString();
          }
        } catch (e) {
          console.error('Failed to save timeline plan:', e.message);
        }

        // Always include the mermaid_chart in the response if present
        res.json(result);
      } catch (e) {
        console.error('timelineController: Failed to parse JSON:', e, 'data:', data);
        res.status(500).json({ error: 'Invalid response from timeline generator' });
      }
    });
  } catch (err) {
    console.error('timelineController: Exception:', err);
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
    
  py.on('close', async (code) => {
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

        // Persist the plan with detailed phase info so history has full details
          try {
          const phases = Array.isArray(result.plan) ? result.plan.map((p, idx) => normalizePhase(p, idx)) : [];

          const created = await TimelinePlan.create({
            user: req.user?._id,
            current_skills: req.body.current_skills,
            target_job: req.body.target_job,
            timeframe_months: req.body.timeframe_months,
            additional_context: req.body.additional_context,
            mermaid_code: result.mermaid_code || result.mermaid || '',
            phases,
            phase_count: phases.length,
            approx_months: Math.round((phases.reduce((s, p) => s + (p.duration_weeks || 0), 0) || req.body.timeframe_months) / 1),
          });

          if (created && created._id) {
            result.plan_id = created._id.toString();
          }
        } catch (e) {
          console.error('Failed to save generated plan:', e.message);
        }

        res.json({
          plan: result.plan,
          mermaid_code: result.mermaid_code,
          full_response: result.full_response,
          plan_id: result.plan_id
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

// Get timeline history for authenticated user
exports.getTimelineHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ error: 'Unauthorized' });
    const records = await TimelinePlan.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ records });
  } catch (err) {
    console.error('getTimelineHistory error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get a single timeline plan by id (must be owner)
exports.getTimelineById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user._id) return res.status(401).json({ error: 'Unauthorized' });

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const plan = await TimelinePlan.findOne({ _id: id, user: req.user._id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    res.json({ plan });
  } catch (err) {
    console.error('getTimelineById error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Re-run generator for an existing plan and persist missing phase details
exports.regeneratePlan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user._id) return res.status(401).json({ error: 'Unauthorized' });

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const plan = await TimelinePlan.findOne({ _id: id, user: req.user._id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // Prepare args from saved plan
    const current_skills = plan.current_skills || [];
    const target_job = plan.target_job || '';
    const timeframe_months = plan.timeframe_months || 6;
    const additional_context = plan.additional_context || {};

    // spawn generator (reuse gemini_plan.py)
    const { spawn } = require('child_process');
    const py = spawn('python', ['utils/gemini_plan.py', JSON.stringify(current_skills), target_job, timeframe_months.toString(), JSON.stringify(additional_context)]);
    let data = '';
    let error = '';

    py.stdout.on('data', (chunk) => { data += chunk.toString(); });
    py.stderr.on('data', (chunk) => { error += chunk.toString(); console.log('gemini_plan.py stderr:', chunk.toString()); });

    py.on('close', async (code) => {
      if (code !== 0 || error) {
        console.error('regeneratePlan error:', error);
        return res.status(500).json({ error: error || 'Failed to regenerate plan' });
      }
        try {
        const result = JSON.parse(data);
        // map and persist phases
        const phases = Array.isArray(result.plan) ? result.plan.map((p, idx) => normalizePhase(p, idx)) : [];

        plan.phases = phases;
  plan.mermaid_code = result.mermaid_code || result.mermaid || plan.mermaid_code;
  plan.phase_count = phases.length;
  plan.approx_months = Math.round((phases.reduce((s, p) => s + (p.duration_weeks || 0), 0) || plan.timeframe_months) / 1);
        await plan.save();

        res.json({ plan });
      } catch (e) {
        console.error('regeneratePlan parse/save error:', e, 'data:', data);
        res.status(500).json({ error: 'Invalid response from plan generator' });
      }
    });
  } catch (err) {
    console.error('regeneratePlan exception:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Mark a phase as completed
exports.markPhaseComplete = async (req, res) => {
  try {
    const { planId, phaseOrder } = req.body;
    if (!req.user || !req.user._id) return res.status(401).json({ error: 'Unauthorized' });
    if (!planId || !phaseOrder) return res.status(400).json({ error: 'planId and phaseOrder are required' });

    console.log('markPhaseComplete called with planId:', planId, 'phaseOrder:', phaseOrder, 'user:', req.user?._id);

    // basic validation
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ error: 'Invalid planId' });
    }

    // Find plan by id regardless of owner
    const plan = await TimelinePlan.findOne({ _id: planId });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // If plan has an owner and it's not the current user, forbid
    if (plan.user && req.user && plan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // If plan has no owner but user is authenticated, claim ownership
    if (!plan.user && req.user && req.user._id) {
      plan.user = req.user._id;
    }

    const phase = plan.phases.find(p => p.order === Number(phaseOrder));
    if (!phase) return res.status(404).json({ error: 'Phase not found' });

    phase.completed = true;
    phase.completedAt = new Date();
    await plan.save();

    res.json({ success: true, plan });
  } catch (err) {
    console.error('markPhaseComplete error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
