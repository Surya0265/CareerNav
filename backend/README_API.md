# CareerNav Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Gemini API**
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Update the `.env` file:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Run the Application**
   ```bash
   python app.py
   ```

## API Endpoints

### Resume Processing
- `POST /process` - Complete resume processing with AI analysis
- `POST /extract-resume` - Extract text content from resume

### AI-Powered Endpoints
- `POST /ai/career-recommendations` - Get career recommendations
- `POST /ai/skill-analysis` - Analyze skill gaps
- `POST /ai/resume-analysis` - Analyze resume quality
- `POST /ai/learning-path` - Generate learning path
- `GET /ai/status` - Check AI service status

## Example Usage

### Complete Resume Processing
```javascript
const formData = new FormData();
formData.append('resume', file);
formData.append('industries', 'Technology');
formData.append('goals', 'Senior Developer');
formData.append('location', 'Remote');

fetch('/process', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    console.log('AI Insights:', data.ai_insights);
});
```

### Career Recommendations
```javascript
fetch('/ai/career-recommendations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        skills_by_category: {
            'technical': ['Python', 'JavaScript', 'React'],
            'soft_skills': ['Communication', 'Leadership']
        },
        preferences: {
            'industries': 'Technology',
            'goals': 'Team Lead',
            'location': 'San Francisco'
        },
        experience_level: 'intermediate'
    })
})
.then(response => response.json())
.then(data => {
    console.log('Recommendations:', data.recommendations);
});
```

### Skill Analysis
```javascript
fetch('/ai/skill-analysis', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        current_skills: ['Python', 'JavaScript', 'SQL'],
        target_roles: ['Full Stack Developer', 'DevOps Engineer'],
        preferences: {
            'industries': 'Technology',
            'location': 'Remote'
        }
    })
})
.then(response => response.json())
.then(data => {
    console.log('Skill Analysis:', data.analysis);
});
```

### Learning Path Generation
```javascript
fetch('/ai/learning-path', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        current_skills: ['HTML', 'CSS', 'JavaScript'],
        target_role: 'Full Stack Developer',
        learning_preference: 'practical' // 'practical', 'theoretical', 'balanced'
    })
})
.then(response => response.json())
.then(data => {
    console.log('Learning Path:', data.learning_path);
});
```

## Response Examples

### Career Recommendations Response
```json
{
  "success": true,
  "recommendations": {
    "recommended_roles": [
      {
        "title": "Senior Frontend Developer",
        "match_percentage": 85,
        "required_skills": ["React", "JavaScript", "CSS"],
        "missing_skills": ["TypeScript", "Testing"],
        "salary_range": "$90,000 - $120,000",
        "growth_potential": "High",
        "industry": "Technology",
        "reasoning": "Strong match with current frontend skills"
      }
    ],
    "industry_insights": {
      "trending_industries": ["Technology", "FinTech"],
      "growth_sectors": ["AI/ML", "Cloud Computing"],
      "recommendations": "Focus on modern frontend frameworks"
    },
    "next_steps": [
      "Learn TypeScript",
      "Build a portfolio project",
      "Practice system design"
    ],
    "confidence_score": 0.85
  }
}
```

### Skill Analysis Response
```json
{
  "success": true,
  "analysis": {
    "skill_gaps": [
      {
        "skill": "TypeScript",
        "importance": "High",
        "current_level": "Beginner",
        "target_level": "Intermediate",
        "learning_priority": 1,
        "estimated_time": "2-3 months",
        "resources": ["TypeScript Handbook", "Practice Projects"]
      }
    ],
    "learning_path": [
      {
        "phase": "Foundation",
        "duration": "1-2 months",
        "skills_to_focus": ["TypeScript Basics", "Type Safety"],
        "milestones": ["Complete TypeScript course", "Build typed project"]
      }
    ],
    "certifications": [
      {
        "name": "Microsoft TypeScript Certification",
        "provider": "Microsoft",
        "relevance": "High",
        "estimated_cost": "$200-$300"
      }
    ],
    "practice_projects": [
      "Build a typed React application",
      "Convert existing JS project to TypeScript"
    ]
  }
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `FLASK_ENV` | Flask environment (development/production) | No |
| `FLASK_DEBUG` | Enable Flask debug mode | No |

## Features

- **Resume Text Extraction**: PDF and DOCX support
- **Skill Detection**: Categorized skill identification
- **AI Career Recommendations**: Personalized role suggestions
- **Skill Gap Analysis**: Identify missing skills for target roles
- **Resume Quality Analysis**: ATS compatibility and improvement suggestions
- **Learning Path Generation**: Customized learning roadmaps
- **Industry Insights**: Market trends and growth sectors

## Error Handling

The API includes comprehensive error handling:
- Invalid file formats
- Missing API keys
- AI service failures
- Malformed requests

All errors return appropriate HTTP status codes and descriptive error messages.

## Security Notes

- Uploaded files are automatically cleaned up after processing
- API keys should be kept secure and not committed to version control
- File size limits are enforced (16MB max)
- Only allowed file extensions are processed
