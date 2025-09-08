

import os
import json
import re
import requests
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

def create_career_timeline(current_skills, target_job, timeframe_months, additional_context=None):
    """
    Create a career timeline focused on YouTube resources
    
    Parameters:
        current_skills (list): List of user's current skills
        target_job (str): The job role the user wants to achieve
        timeframe_months (int): Number of months for the career transition
        additional_context (dict): Optional additional context
    
    Returns:
        dict: A structured career timeline with YouTube resources
    """
    # Create a simplified timeline structure
    skills_text = ", ".join(current_skills) if current_skills else "various technical skills"
    
    # Define the timeline phases based on timeframe
    if timeframe_months <= 3:
        phases = [{"name": "Quick Preparation", "months": timeframe_months}]
    else:
        foundation_months = max(1, timeframe_months // 3)
        intermediate_months = max(1, timeframe_months // 3)
        advanced_months = timeframe_months - foundation_months - intermediate_months
        phases = [
            {"name": "Foundation", "months": foundation_months},
            {"name": "Intermediate Skills", "months": intermediate_months},
            {"name": "Advanced Preparation", "months": advanced_months}
        ]
    
    # Create the basic timeline structure
    timeline = []
    for phase in phases:
        phase_skills = []
        phase_resources = []
        
        if "Foundation" in phase["name"]:
            phase_skills = ["Basic programming fundamentals", "Core concepts", "Foundational tools"]
        elif "Intermediate" in phase["name"]:
            phase_skills = ["Advanced techniques", "Project development", "Specialized knowledge"]
        else:
            phase_skills = ["Expert-level concepts", "Industry best practices", "Interview preparation"]
            
        timeline.append({
            "phase": f"{phase['name']} (Months {len(timeline)*2+1}-{len(timeline)*2+phase['months']})",
            "skills": phase_skills,
            "resources": phase_resources
        })
    
    # Get YouTube videos for enriching the timeline
    search_terms = [
        f"{target_job} tutorial",
        f"{target_job} career path",
        f"{target_job} for beginners", 
        f"learn {target_job}"
    ]
    
    youtube_resources = search_youtube_videos(search_terms, max_results=5)
    
    # Structure the response
    result = {
        "title": f"Career Path: {target_job}",
        "summary": f"A {timeframe_months}-month learning roadmap focusing on {skills_text} skills needed for a {target_job} role.",
        "youtube_resources": youtube_resources,
        "timeline": timeline,
        "advice": "Focus on building practical projects that demonstrate your skills. Create a strong GitHub portfolio showing your work. Network with other professionals and contribute to open-source projects."
    }
    
    return result

def search_youtube_videos(search_terms, max_results=5, language="en", min_duration_minutes=5):
    """
    Search for YouTube videos using the YouTube API
    
    Parameters:
        search_terms (list): List of search terms
        max_results (int): Maximum number of results to return
        language (str): Language preference for videos
        min_duration_minutes (int): Minimum video duration in minutes
        
    Returns:
        list: List of YouTube video information
    """
    if not YOUTUBE_API_KEY:
        return []
        
    results = []
    for term in search_terms:
        try:
            search_url = f"https://www.googleapis.com/youtube/v3/search"
            search_params = {
                "part": "snippet",
                "q": term,
                "key": YOUTUBE_API_KEY,
                "maxResults": max_results * 2,  # Request more to filter later
                "type": "video",
                "relevanceLanguage": language,
                "order": "viewCount",  # Sort by view count for quality content
                "videoDefinition": "high"
            }
            
            response = requests.get(search_url, search_params)
            if response.status_code == 200:
                search_data = response.json()
                video_ids = []
                for item in search_data.get("items", []):
                    if item.get("id", {}).get("videoId"):
                        video_ids.append(item.get("id", {}).get("videoId"))
                        
                if not video_ids:
                    continue
                    
                # Get detailed information for these videos
                video_url = f"https://www.googleapis.com/youtube/v3/videos"
                video_params = {
                    "part": "contentDetails,statistics,snippet",
                    "id": ",".join(video_ids),
                    "key": YOUTUBE_API_KEY
                }
                
                video_response = requests.get(video_url, video_params)
                if video_response.status_code == 200:
                    video_data = video_response.json()
                    for item in video_data.get("items", []):
                        # Parse duration (in ISO 8601 format like PT1H30M15S)
                        duration_str = item.get("contentDetails", {}).get("duration", "PT0M0S")
                        hours = 0
                        minutes = 0
                        seconds = 0
                        
                        hour_match = re.search(r'(\d+)H', duration_str)
                        if hour_match:
                            hours = int(hour_match.group(1))
                            
                        min_match = re.search(r'(\d+)M', duration_str)
                        if min_match:
                            minutes = int(min_match.group(1))
                            
                        sec_match = re.search(r'(\d+)S', duration_str)
                        if sec_match:
                            seconds = int(sec_match.group(1))
                            
                        total_minutes = (hours * 60) + minutes + (seconds / 60)
                        
                        # Only include videos that meet the minimum duration
                        if total_minutes >= min_duration_minutes:
                            snippet = item.get("snippet", {})
                            statistics = item.get("statistics", {})
                            
                            # Create simplified video object with essential info
                            # Format duration to include hours if present
                            duration_display = ""
                            if hours > 0:
                                duration_display = f"{hours} hours "
                            duration_display += f"{minutes} mins {seconds} secs"
                            
                            results.append({
                                "title": snippet.get("title", ""),
                                "url": f"https://www.youtube.com/watch?v={item.get('id')}",
                                "channel": snippet.get("channelTitle", ""),
                                "views": statistics.get("viewCount", "0"),
                                "duration": duration_display
                            })
                    
                    # Sort by view count (most popular first)
                    results.sort(key=lambda x: int(x.get("views", "0")), reverse=True)
                    
            # If we have enough results, stop searching
            if len(results) >= max_results:
                results = results[:max_results]  # Limit to requested number
                break
                
        except Exception as e:
            print(f"Error searching YouTube: {str(e)}")
            
    return results

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
