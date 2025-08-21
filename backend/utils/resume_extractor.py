import PyPDF2
import pdfplumber
from docx import Document
import os
import re

def extract_text_from_pdf(file_path):
    """
    Extract text from PDF file using both PyPDF2 and pdfplumber for better coverage
    """
    text = ""
    
    try:
        # First try with pdfplumber (better for complex layouts)
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        # If pdfplumber didn't extract much text, try PyPDF2
        if len(text.strip()) < 100:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
    
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        return None
    
    return text.strip()

def extract_text_from_docx(file_path):
    """
    Extract text from DOCX file
    """
    try:
        doc = Document(file_path)
        text = []
        
        # Extract text from paragraphs
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text.append(paragraph.text)
        
        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        text.append(cell.text)
        
        return "\n".join(text)
    
    except Exception as e:
        print(f"Error extracting DOCX text: {str(e)}")
        return None

def extract_resume_text(file_path):
    """
    Main function to extract text from resume file
    Supports PDF and DOCX formats
    """
    if not os.path.exists(file_path):
        return None
    
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    else:
        print(f"Unsupported file format: {file_extension}")
        return None

def clean_extracted_text(text):
    """
    Clean and normalize extracted text
    """
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters that might cause issues
    text = re.sub(r'[^\w\s@.,()-]', '', text)
    
    # Normalize line breaks
    text = text.replace('\n', ' ').replace('\r', ' ')
    
    return text.strip()

def extract_basic_info(text):
    """
    Extract basic information from resume text
    """
    info = {
        'email': None,
        'phone': None,
        'skills': [],
        'experience_keywords': [],
        'education_keywords': []
    }
    
    if not text:
        return info
    
    # Extract email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    if emails:
        info['email'] = emails[0]
    
    # Extract phone number (basic pattern)
    phone_pattern = r'(\+91[-.\s]?)?(\d{10}|\d{5}\s\d{5})'

    phones = re.findall(phone_pattern, text)
    if phones:
        info['phone'] = ''.join(phones[0]) if isinstance(phones[0], tuple) else phones[0]
    
    # Common skill keywords
    skill_keywords = [
        'python', 'java', 'javascript', 'react', 'node.js', 'html', 'css',
        'sql', 'mongodb', 'postgresql', 'mysql', 'git', 'docker', 'kubernetes',
        'aws', 'azure', 'gcp', 'machine learning', 'ai', 'data science',
        'project management', 'agile', 'scrum', 'leadership', 'communication'
    ]
    
    text_lower = text.lower()
    for skill in skill_keywords:
        if skill in text_lower:
            info['skills'].append(skill)
    
    # Experience keywords
    exp_keywords = ['experience', 'worked', 'developed', 'managed', 'lead', 'created', 'built']
    for keyword in exp_keywords:
        if keyword in text_lower:
            info['experience_keywords'].append(keyword)
    
    # Education keywords
    edu_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'education']
    for keyword in edu_keywords:
        if keyword in text_lower:
            info['education_keywords'].append(keyword)
    
    return info
