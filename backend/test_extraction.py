import requests
import os

def test_resume_extraction():
    """
    Test script to demonstrate resume extraction functionality
    """
    # Flask app URL
    base_url = "http://127.0.0.1:5000"
    
    # Test the basic endpoint
    print("Testing basic endpoint...")
    response = requests.get(f"{base_url}/")
    print(f"Basic endpoint response: {response.text}")
    
    # Test resume extraction endpoint
    print("\nTesting resume extraction endpoint...")
    
    # Check if there's a sample resume in uploads folder
    uploads_dir = "./uploads"
    if os.path.exists(uploads_dir):
        resume_files = [f for f in os.listdir(uploads_dir) if f.endswith(('.pdf', '.docx'))]
        if resume_files:
            sample_resume = os.path.join(uploads_dir, resume_files[0])
            print(f"Found sample resume: {sample_resume}")
            
            # Test extraction
            with open(sample_resume, 'rb') as f:
                files = {'resume': f}
                response = requests.post(f"{base_url}/extract-resume", files=files)
                
                if response.status_code == 200:
                    result = response.json()
                    print("✅ Resume extraction successful!")
                    print(f"📄 File: {result['file_info']['filename']}")
                    print(f"📏 Text length: {result['file_info']['text_length']} characters")
                    print(f"📧 Email found: {result['extracted_content']['basic_info'].get('email', 'Not found')}")
                    print(f"📱 Phone found: {result['extracted_content']['basic_info'].get('phone', 'Not found')}")
                    print(f"🛠️ Skills detected: {len(result['extracted_content']['basic_info'].get('skills', []))}")
                    print(f"✔️ Has contact info: {result['analysis']['has_contact_info']}")
                    print(f"📝 Appears complete: {result['analysis']['appears_complete']}")
                    
                    if result['extracted_content']['basic_info'].get('skills'):
                        print(f"🔧 Detected skills: {', '.join(result['extracted_content']['basic_info']['skills'][:5])}")
                    
                    # Show first 200 characters of extracted text
                    text_preview = result['extracted_content']['full_text'][:200]
                    print(f"\n📖 Text preview:\n{text_preview}...")
                    
                else:
                    print(f"❌ Error: {response.status_code} - {response.text}")
        else:
            print("❌ No sample resume files found in uploads folder")
    else:
        print("❌ Uploads folder not found")

if __name__ == "__main__":
    test_resume_extraction()
