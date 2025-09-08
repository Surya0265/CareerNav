import json
import subprocess
import sys

def test_gemini_plan():
    # Test parameters
    current_skills = ["Python", "JavaScript"]
    target_job = "Web Developer"
    timeframe_months = 6
    
    # Convert skills to JSON string
    skills_json = json.dumps(current_skills)
    
    # Construct command
    cmd = [
        sys.executable,  # Use the same Python interpreter
        "utils/gemini_plan.py",
        skills_json,
        target_job,
        str(timeframe_months)
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    
    try:
        # Run the process
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True,
            check=True
        )
        
        # Print stderr output (logs)
        if result.stderr:
            print(f"STDERR (LOGS):\n{result.stderr}")
        
        # Print and parse stdout (JSON)
        if result.stdout:
            print(f"STDOUT (JSON):\n{result.stdout}")
            try:
                json_data = json.loads(result.stdout)
                print("\nSuccessfully parsed JSON response")
                
                if "plan" in json_data:
                    print(f"Plan length: {len(json_data['plan'])} chars")
                if "mermaid_code" in json_data:
                    print(f"Mermaid code length: {len(json_data['mermaid_code'])} chars")
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON: {e}")
    except subprocess.CalledProcessError as e:
        print(f"Process failed with error code {e.returncode}")
        print(f"STDERR: {e.stderr}")
        print(f"STDOUT: {e.stdout}")

if __name__ == "__main__":
    test_gemini_plan()
