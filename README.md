# CareerNav

A comprehensive career navigation system that helps users analyze resumes, generate career timelines, create career plans with visual flowcharts, and find job opportunities based on their skills.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### 1. Timeline API Endpoints

#### 1.1. Generate Career Timeline
Generates a timeline of learning resources and milestones for a career path.

**Endpoint:** `POST /timeline/generate-timeline`

**Request:**
```json
{
  "current_skills": ["JavaScript", "HTML", "CSS"],
  "target_job": "Full Stack Developer",
  "timeframe_months": 6,
  "additional_context": {
    "preferred_learning_style": "project-based",
    "focus_area": "MERN stack"
  }
}
```

**Response:**
```json
{
  "timeline": [
    {
      "phase": "Foundation Building (Months 1-2)",
      "description": "Focus on strengthening JavaScript fundamentals and learning React",
      "skills": ["Advanced JavaScript", "React", "Git"],
      "resources": [
        {
          "title": "Modern JavaScript From The Beginning",
          "url": "https://www.youtube.com/watch?v=hdI2bqOjy3c",
          "type": "YouTube",
          "duration": "1:48:17"
        }
        // More resources
      ]
    }
    // More phases
  ],
  "summary": "This 6-month learning path will help you transition from frontend basics to a full stack developer role"
}
```

#### 1.2. Generate Career Plan with Mermaid Flowchart
Generates a detailed career plan with a visual Mermaid flowchart.

**Endpoint:** `POST /timeline/generate-plan`

**Request:**
```json
{
  "current_skills": ["Python", "SQL", "Data Analysis"],
  "target_job": "Data Scientist",
  "timeframe_months": 9
}
```

**Response:**
```json
{
  "plan": "# Career Transition Plan: From Data Analysis to Data Scientist\n\n## Overview\nThis 9-month plan will help you transition...",
  "mermaid_code": "flowchart TD\n  A[Current Skills: Python, SQL, Data Analysis] --> B[Foundation: Statistics & ML Theory]\n  B --> C[Applied Machine Learning]\n  C --> D[Portfolio Projects]\n  D --> E[Job Preparation]\n  E --> F[Data Scientist]\n\n  style A fill:#f9f,stroke:#333,stroke-width:2px\n  style F fill:#bbf,stroke:#333,stroke-width:2px",
  "full_response": {
    // Additional details returned by the API
  }
}
```

### 2. Resume API Endpoints

#### 2.1. Resume Upload and Analysis
Uploads a resume and processes it to extract information and provide career recommendations.

**Endpoint:** `POST /resume/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Form Fields:
  - `resume`: PDF or DOCX file
  - `industries`: JSON array of preferred industries (e.g., `["Technology", "Finance"]`)
  - `goals`: String describing career goals
  - `location`: Preferred location for job search

Example curl command:
```bash
curl -X POST http://localhost:3000/api/resume/upload \
  -F "resume=@path/to/your/resume.pdf" \
  -F "industries=[\"Technology\", \"Finance\"]" \
  -F "goals=Looking for a senior developer role" \
  -F "location=New York"
```

**Response:**
```json
{
  "summary": "Resume processed successfully with AI analysis",
  "extracted_info": {
    "text_length": 2548,
    "email": "example@email.com",
    "phone": "123-456-7890",
    "detected_skills": ["JavaScript", "React", "Node.js", "SQL"],
    "skills_by_category": {
      "programming_languages": ["JavaScript", "Python"],
      "frameworks": ["React", "Express"],
      "databases": ["SQL", "MongoDB"]
    },
    "total_skills_found": 15,
    "has_experience_keywords": true,
    "has_education_keywords": true
  },
  "preferences": {
    "industries": ["Technology", "Finance"],
    "goals": "Looking for a senior developer role",
    "location": "New York"
  },
  "ai_insights": {
    "career_recommendations": {
      "recommended_roles": [
        {
          "title": "Senior Frontend Developer",
          "match_score": 85,
          "description": "..."
        }
        // More recommended roles
      ]
    },
    "skill_improvements": {
      "missing_skills": ["TypeScript", "AWS"],
      "upgrade_suggestions": [
        {
          "skill": "TypeScript",
          "reason": "Growing demand in frontend roles"
        }
        // More suggestions
      ]
    },
    "resume_analysis": {
      "strengths": ["Strong technical skills", "Project experience"],
      "gaps": ["Leadership experience", "Enterprise experience"],
      "improvement_suggestions": [
        "Add metrics to demonstrate impact",
        "Highlight team collaboration"
      ]
    },
    "learning_path": {
      "path_name": "Senior Frontend Developer Path",
      "total_duration": "3 months",
      "phases": [
        {
          "phase_number": 1,
          "title": "Advanced Frontend Skills",
          "duration": "4 weeks",
          "skills": ["TypeScript", "Performance Optimization"],
          "resources": [
            {
              "type": "course",
              "name": "TypeScript Deep Dive",
              "provider": "Frontend Masters",
              "duration": "8 hours",
              "cost": "Subscription"
            }
          ]
        }
        // More phases
      ]
    }
  }
}
```

### 3. Jobs API Endpoints

#### 3.1. Get Job Recommendations Based on Resume
Uploads a resume, extracts skills, and returns relevant job listings.

**Endpoint:** `POST /jobs/jobs-by-resume`

**Request:**
- Content-Type: `multipart/form-data`
- Form Fields:
  - `resume`: PDF or DOCX file
  - `city`: Target city for job search (required)
  - `country`: Country code (default: 'us')

Example curl command:
```bash
curl -X POST http://localhost:3000/api/jobs/jobs-by-resume \
  -F "resume=@path/to/your/resume.pdf" \
  -F "city=San Francisco" \
  -F "country=us"
```

**Response:**
```json
{
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "jobs": [
    {
      "title": "Senior Frontend Developer",
      "company": "Tech Company Inc",
      "location": "San Francisco, US",
      "salary": "$120,000 - $150,000 yearly",
      "applyLink": "https://example.com/apply/job123"
    },
    {
      "title": "Full Stack JavaScript Developer",
      "company": "Startup Co",
      "location": "San Francisco, US",
      "salary": "Not specified",
      "applyLink": "https://example.com/apply/job456"
    }
    // More job listings
  ]
}
```

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Surya0265/CareerNav.git
cd CareerNav
```

2. Install Node.js dependencies:
```bash
npm install
cd backend
npm install
```

3. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with the following:
```
GEMINI_API_KEY=your_gemini_api_key
RAPIDAPI_KEY=your_rapidapi_key_for_job_search
```

5. Start the Node.js server:
```bash
cd backend
node server.js
```

6. Start the Python Flask server (in a separate terminal):
```bash
cd backend
python app.py
```

7. The application will be available at:
- Node.js Backend: http://localhost:3000
- Python Flask Backend: http://127.0.0.1:5000