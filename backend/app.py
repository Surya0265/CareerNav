from flask import Flask, request, jsonify
import os
from utils.resume_extractor import extract_resume_text, clean_extracted_text, extract_basic_info

app = Flask(__name__)
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/', methods=['GET'])
def st():
    return "Hii"

@app.route('/process', methods=['POST'])
def process_resume():
    file = request.files.get('resume')
    industries = request.form.get('industries')
    goals = request.form.get('goals')
    location = request.form.get('location')

    if not file:
        return jsonify({'error': 'No resume uploaded'}), 400

    # Save file temporarily
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        # Extract text from resume
        extracted_text = extract_resume_text(file_path)
        
        if not extracted_text:
            return jsonify({'error': 'Could not extract text from resume'}), 400
        
        # Clean the extracted text
        clean_text = clean_extracted_text(extracted_text)
        
        # Extract basic information
        basic_info = extract_basic_info(clean_text)
        
        print("Industries:", industries)
        print("Goals:", goals)
        print("Location:", location)
        print("Extracted resume length:", len(clean_text))
        print("Basic info extracted:", basic_info)

        # Enhanced response with extracted information
        response = {
            "summary": "Resume processed successfully",
            "extracted_info": {
                "text_length": len(clean_text),
                "email": basic_info.get('email'),
                "phone": basic_info.get('phone'),
                "detected_skills": basic_info.get('skills', []),
                "has_experience_keywords": len(basic_info.get('experience_keywords', [])) > 0,
                "has_education_keywords": len(basic_info.get('education_keywords', [])) > 0
            },
            "preferences": {
                "industries": industries,
                "goals": goals,
                "location": location
            },
            "suggested_roles": ["Backend Developer", "AI Engineer"],
            "recommended_skills": ["Python", "Docker", "FastAPI"],
            "raw_text_preview": clean_text[:500] + "..." if len(clean_text) > 500 else clean_text
        }
        
    except Exception as e:
        print(f"Error processing resume: {str(e)}")
        return jsonify({'error': f'Error processing resume: {str(e)}'}), 500
    
    finally:
        # Clean up - remove the uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: Could not remove file {file_path}: {str(e)}")

    return jsonify(response)

@app.route('/extract-resume', methods=['POST'])
def extract_resume():
    """
    Endpoint specifically for extracting text content from resume
    """
    file = request.files.get('resume')
    
    if not file:
        return jsonify({'error': 'No resume uploaded'}), 400
    
    # Check file extension
    allowed_extensions = ['.pdf', '.docx', '.doc']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        return jsonify({'error': f'Unsupported file format. Allowed: {", ".join(allowed_extensions)}'}), 400
    
    # Save file temporarily
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    try:
        # Extract text from resume
        extracted_text = extract_resume_text(file_path)
        
        if not extracted_text:
            return jsonify({'error': 'Could not extract text from resume. The file might be corrupted or contain only images.'}), 400
        
        # Clean the extracted text
        clean_text = clean_extracted_text(extracted_text)
        
        # Extract basic information
        basic_info = extract_basic_info(clean_text)
        
        response = {
            "success": True,
            "file_info": {
                "filename": file.filename,
                "file_type": file_extension,
                "text_length": len(clean_text)
            },
            "extracted_content": {
                "full_text": clean_text,
                "basic_info": basic_info
            },
            "analysis": {
                "has_contact_info": bool(basic_info.get('email') or basic_info.get('phone')),
                "skills_detected": len(basic_info.get('skills', [])),
                "appears_complete": len(clean_text) > 200  # Basic completeness check
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error extracting resume: {str(e)}")
        return jsonify({'error': f'Error extracting resume: {str(e)}'}), 500
    
    finally:
        # Clean up - remove the uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: Could not remove file {file_path}: {str(e)}")

if __name__ == '__main__':
    app.run(port=5000,debug=True)
