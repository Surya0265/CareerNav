# Resume Content Extraction API

This module provides functionality to extract text content from PDF and DOCX resume files.

## Features

- **Multi-format support**: Extracts text from PDF and DOCX files
- **Robust extraction**: Uses multiple libraries (PyPDF2, pdfplumber) for better PDF text extraction
- **Basic information parsing**: Automatically detects emails, phone numbers, skills, and keywords
- **Clean text output**: Normalizes and cleans extracted text
- **Error handling**: Graceful handling of corrupted or unsupported files

## API Endpoints

### 1. `/extract-resume` (POST)
Dedicated endpoint for resume text extraction.

**Request:**
```bash
curl -X POST -F "resume=@path/to/resume.pdf" http://localhost:5000/extract-resume
```

**Response:**
```json
{
  "success": true,
  "file_info": {
    "filename": "resume.pdf",
    "file_type": ".pdf",
    "text_length": 1543
  },
  "extracted_content": {
    "full_text": "John Doe\nSoftware Engineer...",
    "basic_info": {
      "email": "john.doe@email.com",
      "phone": "+1-234-567-8900",
      "skills": ["python", "javascript", "react"],
      "experience_keywords": ["developed", "managed", "led"],
      "education_keywords": ["bachelor", "university"]
    }
  },
  "analysis": {
    "has_contact_info": true,
    "skills_detected": 3,
    "appears_complete": true
  }
}
```

### 2. `/process` (POST)
Enhanced endpoint that processes resume along with user preferences.

**Request:**
```bash
curl -X POST \
  -F "resume=@path/to/resume.pdf" \
  -F "industries=Technology" \
  -F "goals=Software Development" \
  -F "location=New York" \
  http://localhost:5000/process
```

## Supported File Formats

- **PDF**: `.pdf` files
- **Microsoft Word**: `.docx`, `.doc` files

## Installation Requirements

```bash
pip install flask PyPDF2 python-docx pdfplumber requests
```

## Usage Examples

### Python Code Example

```python
import requests

# Extract resume content
with open('resume.pdf', 'rb') as f:
    files = {'resume': f}
    response = requests.post('http://localhost:5000/extract-resume', files=files)
    
if response.status_code == 200:
    data = response.json()
    print(f"Extracted {data['file_info']['text_length']} characters")
    print(f"Email: {data['extracted_content']['basic_info']['email']}")
    print(f"Skills: {data['extracted_content']['basic_info']['skills']}")
```

### JavaScript/Frontend Example

```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

fetch('http://localhost:5000/extract-resume', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    console.log('Extracted text:', data.extracted_content.full_text);
    console.log('Basic info:', data.extracted_content.basic_info);
});
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: No file uploaded or unsupported format
- `500 Internal Server Error`: File processing error

Example error response:
```json
{
  "error": "Unsupported file format. Allowed: .pdf, .docx, .doc"
}
```

## Text Processing Features

1. **Email Detection**: Regex pattern to find email addresses
2. **Phone Number Detection**: Pattern matching for various phone formats
3. **Skill Extraction**: Keyword matching for common technical and soft skills
4. **Experience Keywords**: Identifies action words indicating work experience
5. **Education Keywords**: Detects education-related terms
6. **Text Cleaning**: Removes excessive whitespace and normalizes formatting

## Notes

- Files are temporarily saved and automatically deleted after processing
- Large files may take longer to process
- Image-based PDFs (scanned documents) may not extract text properly
- The API is designed for development use; use a production WSGI server for deployment
