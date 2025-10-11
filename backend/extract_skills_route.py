from flask import request, jsonify
import os
import time
from utils.resume_extractor import extract_resume_text, clean_extracted_text, extract_basic_info
from app import app, UPLOAD_FOLDER

@app.route('/extract-skills', methods=['POST'])
def extract_skills():
    """
    Endpoint specifically for extracting skills from a resume without generating AI recommendations
    """
    file = request.files.get('resume')
    
    if not file:
        return jsonify({'error': 'No resume file provided'}), 400

    # Create upload directory if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
        
    # Save the file temporarily
    filename = f"resume-{int(time.time() * 1000)}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    try:
        # Extract text from the resume
        extracted_text = extract_resume_text(file_path)
        clean_text = clean_extracted_text(extracted_text)
        
        # Extract basic information
        basic_info = extract_basic_info(clean_text, extracted_text)
        
        # Create a response with just the extracted skills
        response = {
            'skills': basic_info.get('skills', []),
            'skills_by_category': basic_info.get('skills_summary', {}),
            'total_skills_found': len(basic_info.get('skills', [])),
            'extracted_info': {
                'email': basic_info.get('email', ''),
                'detected_skills': basic_info.get('skills', []),
                'experience_entries': basic_info.get('experience_entries', []),
                'project_entries': basic_info.get('project_entries', []),
                'experience_keywords': basic_info.get('experience_keywords', []),
            }
        }
        
    except Exception as e:
        print(f"Error extracting skills: {str(e)}")
        return jsonify({'error': f'Error extracting skills: {str(e)}'}), 500
    
    finally:
        # Clean up - remove the uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: Could not remove file {file_path}: {str(e)}")

    return jsonify(response)