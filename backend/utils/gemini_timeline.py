

import os
import json
import re
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')

def create_career_timeline(current_skills, target_job, timeframe_months, additional_context=None):
    """
    Create a detailed, personalized career timeline using Gemini AI
    
    Parameters:
        current_skills (list): List of user's current skills
        target_job (str): The job role the user wants to achieve
        timeframe_months (int): Number of months for the career transition
        additional_context (dict): Optional additional context (projects, experience, education)
    
    Returns:
        dict: A structured career timeline with detailed milestones
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY not set"}
    
    # Build context from additional data
    context_text = ""
    if additional_context:
        if additional_context.get("projects"):
            context_text += f"\nProjects: {json.dumps(additional_context['projects'], indent=2)}"
        if additional_context.get("experience"):
            context_text += f"\nExperience: {json.dumps(additional_context['experience'], indent=2)}"
        if additional_context.get("education"):
            context_text += f"\nEducation: {json.dumps(additional_context['education'], indent=2)}"
    
    skills_text = ", ".join(current_skills) if current_skills else "various technical skills"
    
    prompt = f"""Create a highly detailed, step-by-step career development timeline for someone targeting the role: {target_job}

CURRENT PROFILE:
- Current Skills: {skills_text}
- Target Role: {target_job}
- Available Time: {timeframe_months} months
{context_text}

Generate a detailed timeline with the following structure:

1. Divide the {timeframe_months} months into 3-4 clear phases
2. For EACH phase, provide:
   - Phase title (e.g., "Foundation Phase - Months 1-2")
   - Detailed description of what to focus on
   - Specific technical skills to learn (list each one)
   - Recommended resources/topics to study
   - Projects/hands-on work to complete
   - Milestones/checkpoints to achieve
   - Estimated duration in weeks

3. Be SPECIFIC and DETAILED - not vague. For example:
   - Instead of "learn databases", say "Learn MongoDB: CRUD operations, indexing, aggregation pipeline, schema design"
   - Instead of "build projects", say "Build: Todo app with Express + MongoDB, Real-time chat app with WebSockets, REST API with authentication"

4. Also provide:
   - Key advice/tips for the transition
   - Common pitfalls to avoid
   - Recommended learning resources
   - Interview preparation strategies

Return the response as VALID JSON in this exact format:
{{
  "summary": "Brief overview of the entire {timeframe_months}-month plan",
  "timeline": [
    {{
      "title": "Phase title (e.g., Foundation Phase)",
      "description": "Detailed description of the phase and its goals",
      "duration_weeks": number,
      "resources": ["Specific resource 1", "Specific resource 2", "..."],
      "skills": ["Specific skill 1: detailed description", "Specific skill 2: detailed description"],
      "projects": ["Project 1 description with tech stack", "Project 2 description with tech stack"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }}
  ],
  "mermaid_chart": "graph showing progression",
  "tips": ["Tip 1", "Tip 2"],
  "interview_prep": ["Question/topic 1", "Question/topic 2"],
  "common_pitfalls": ["Pitfall 1", "Pitfall 2"]
}}

Make this timeline actionable, detailed, and specific to achieving the {target_job} role in {timeframe_months} months."""

    try:
        response = model.generate_content(prompt)
        result_text = response.text
        
        # Extract JSON from the response
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = json.loads(result_text)
        
        return result
    except Exception as e:
        print(f"Error generating timeline with Gemini: {str(e)}", file=sys.stderr)
        return {"error": str(e)}


# Run as script
if __name__ == '__main__':
    try:
        current_skills = json.loads(sys.argv[1])
        target_job = sys.argv[2]
        timeframe_months = int(sys.argv[3])
        additional_context = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}
        
        result = create_career_timeline(current_skills, target_job, timeframe_months, additional_context)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
