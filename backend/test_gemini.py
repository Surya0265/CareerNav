"""
Test script for Gemini API integration
Run this to test the AI features without uploading files
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.gemini_service import GeminiService
from config import check_config

def test_gemini_integration():
    """Test the Gemini integration with sample data"""
    
    print("CareerNav Gemini API Integration Test")
    print("=" * 50)
    
    # Check configuration
    print("\n1. Checking configuration...")
    if not check_config():
        print("❌ Configuration check failed!")
        print("Please ensure GEMINI_API_KEY is set in your .env file")
        return False
    
    print("✅ Configuration is valid")
    
    # Initialize service
    print("\n2. Initializing Gemini service...")
    try:
        service = GeminiService()
        print("✅ Gemini service initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Gemini service: {str(e)}")
        return False
    
    # Test data
    sample_skills = {
        'technical': ['Python', 'JavaScript', 'React', 'SQL'],
        'soft_skills': ['Communication', 'Problem Solving', 'Leadership'],
        'tools': ['Git', 'Docker', 'VS Code']
    }
    
    sample_preferences = {
        'industries': 'Technology',
        'goals': 'Senior Developer Role',
        'location': 'Remote'
    }
    
    # Test career recommendations
    print("\n3. Testing career recommendations...")
    try:
        recommendations = service.generate_career_recommendations(
            skills_by_category=sample_skills,
            preferences=sample_preferences,
            experience_level='intermediate'
        )
        print("✅ Career recommendations generated successfully")
        
        # Display sample results
        if 'recommended_roles' in recommendations:
            print(f"   Found {len(recommendations['recommended_roles'])} role recommendations")
            for role in recommendations['recommended_roles'][:2]:
                print(f"   - {role.get('title', 'Unknown')} ({role.get('match_percentage', 0)}% match)")
        
    except Exception as e:
        print(f"❌ Career recommendations failed: {str(e)}")
        return False
    
    # Test skill analysis
    print("\n4. Testing skill analysis...")
    try:
        skill_analysis = service.suggest_skill_improvements(
            current_skills=['Python', 'JavaScript'],
            target_roles=['Full Stack Developer', 'Backend Developer'],
            preferences=sample_preferences
        )
        print("✅ Skill analysis completed successfully")
        
        if 'skill_gaps' in skill_analysis:
            print(f"   Identified {len(skill_analysis['skill_gaps'])} skill gaps")
        
    except Exception as e:
        print(f"❌ Skill analysis failed: {str(e)}")
        return False
    
    # Test resume analysis
    print("\n5. Testing resume analysis...")
    try:
        sample_resume_text = """
        John Doe
        Software Developer
        Email: john@example.com
        
        Experience:
        - 3 years as Python Developer
        - Built web applications using Flask and React
        - Experience with SQL databases
        
        Skills: Python, JavaScript, HTML, CSS, Git
        """
        
        resume_analysis = service.analyze_resume_gaps(
            skills_by_category=sample_skills,
            preferences=sample_preferences,
            extracted_text=sample_resume_text
        )
        print("✅ Resume analysis completed successfully")
        
        if 'overall_score' in resume_analysis:
            print(f"   Resume score: {resume_analysis['overall_score']}/100")
        
    except Exception as e:
        print(f"❌ Resume analysis failed: {str(e)}")
        return False
    
    # Test learning path
    print("\n6. Testing learning path generation...")
    try:
        learning_path = service.generate_learning_path(
            current_skills=['Python', 'JavaScript'],
            target_role='Full Stack Developer',
            learning_preference='balanced'
        )
        print("✅ Learning path generated successfully")
        
        if 'learning_path' in learning_path and 'phases' in learning_path['learning_path']:
            phases = learning_path['learning_path']['phases']
            print(f"   Generated {len(phases)} learning phases")
        
    except Exception as e:
        print(f"❌ Learning path generation failed: {str(e)}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All tests passed! Gemini integration is working correctly.")
    print("\nYou can now:")
    print("1. Start the Flask application: python app.py")
    print("2. Use the /process endpoint to upload resumes")
    print("3. Use the /ai/* endpoints for specific AI features")
    
    return True

if __name__ == "__main__":
    test_gemini_integration()
