import os
import json
import re
import sys
import requests
from dotenv import load_dotenv
import google.generativeai as genai

# -----------------------------------
# Load Environment Variables
# -----------------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    print(f"DEBUG: Gemini model configured successfully", file=sys.stderr)
else:
    print(f"DEBUG: GEMINI_API_KEY not found in environment", file=sys.stderr)
    model = None

# ===================================================================
# 🔹 Function 1 — DETAILED AI-GENERATED TIMELINE (Gemini)
# ===================================================================
def create_ai_career_timeline(current_skills, target_job, timeframe_months, additional_context=None):
    """
    Generate a detailed, AI-based career timeline using Gemini API.
    Returns an intelligent, structured plan with multiple phases, skills, projects, and tips.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY not set"}
    
    if not model:
        return {"error": "Gemini model not initialized"}

    context_text = ""
    if additional_context:
        if additional_context.get("projects"):
            context_text += f"\nProjects: {json.dumps(additional_context['projects'], indent=2)}"
        if additional_context.get("experience"):
            context_text += f"\nExperience: {json.dumps(additional_context['experience'], indent=2)}"
        if additional_context.get("education"):
            context_text += f"\nEducation: {json.dumps(additional_context['education'], indent=2)}"

    skills_text = ", ".join(current_skills) if current_skills else "various technical skills"

    prompt = f"""
    Create a step-by-step career roadmap to become a {target_job} in {timeframe_months} months.
    Current skills: {skills_text}
    {context_text}

    Format output as VALID JSON with:
    {{
      "summary": "...",
      "timeline": [
        {{
          "title": "Phase name",
          "description": "Detailed explanation",
          "duration_weeks": number,
          "skills": ["Skill 1", "Skill 2", "Skill 3"],
          "projects": ["Project 1", "Project 2"],
          "milestones": ["Milestone 1", "Milestone 2"]
        }}
      ],
      "tips": ["Tip 1", "Tip 2"],
      "interview_prep": ["Question 1", "Question 2"],
      "common_pitfalls": ["Pitfall 1", "Pitfall 2"]
    }}
    """

    try:
        print(f"DEBUG: Calling Gemini API with model: {model}", file=sys.stderr)
        response = model.generate_content(prompt)
        raw_text = response.text
        print(f"DEBUG: Raw response from Gemini API: {raw_text[:500]}", file=sys.stderr)
        
        # Try to extract JSON from the response
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = json.loads(raw_text)
        
        print(f"DEBUG: Parsed AI timeline result keys: {list(result.keys())}", file=sys.stderr)
        
        # Always generate our own Mermaid chart from the timeline data for consistency
        # Don't rely on Gemini's mermaid_chart which may have syntax errors
        if "timeline" in result and result["timeline"]:
            print(f"DEBUG: Generating mermaid_chart from timeline...", file=sys.stderr)
            mermaid_chart = generate_mermaid_chart(target_job, result["timeline"])
            result["mermaid_chart"] = mermaid_chart
        else:
            print(f"DEBUG: No timeline data to generate chart", file=sys.stderr)
        
        return result
    except Exception as e:
        print(f"ERROR: Gemini generation failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return {"error": f"Gemini generation failed: {e}"}


# ===================================================================
# 🔹 Function 2 — YOUTUBE VIDEO RECOMMENDATIONS (YouTube API)
# ===================================================================
def create_youtube_career_timeline(current_skills, target_job, timeframe_months, additional_context=None):
    """
    Fetch YouTube video recommendations based on skills and target job.
    Returns a list of videos with title, channel, views, and duration.
    """
    if not YOUTUBE_API_KEY:
        return {"error": "YOUTUBE_API_KEY not set"}

    skills_text = ", ".join(current_skills) if current_skills else "various technical skills"

    # Generate search terms based on current skills and target job
    search_terms = [
        f"{target_job} tutorial",
        f"{target_job} course",
        f"{target_job} full course",
        f"learn {target_job}",
        f"{target_job} for beginners",
    ]
    
    # Add skill-specific searches for ALL skills with better keywords
    for skill in current_skills:  # Search for all provided skills
        search_terms.append(f"{skill} {target_job}")
        search_terms.append(f"learn {skill} for {target_job}")
        search_terms.append(f"{skill} tutorial {target_job}")
        search_terms.append(f"{skill} course {target_job}")

    # Fetch videos (20+ minutes duration, any view count)
    videos = search_youtube_videos(search_terms, min_views=0, min_duration_minutes=20, max_results=6)

    result = {
        "title": f"Learning Path for {target_job}",
        "summary": f"Top YouTube video recommendations to help you transition to {target_job}",
        "youtube_resources": videos,
        "tips": [
            "Watch full-length, comprehensive tutorials to build deep knowledge",
            "Take detailed notes and pause frequently to understand concepts",
            "Practice coding along with the tutorials in real-time",
            "Build projects after completing each major section",
            "Join communities and engage with other learners"
        ]
    }
    return result


# ===================================================================
# 🔹 Helper Function: YouTube API Search with Filtering
# ===================================================================
def search_youtube_videos(search_terms, max_results=6, min_views=0, min_duration_minutes=20, language="en"):
    """
    Fetch top YouTube videos for given search terms with views and duration.
    """
    if not YOUTUBE_API_KEY:
        print(f"ERROR: YOUTUBE_API_KEY not set", file=sys.stderr)
        return []

    print(f"DEBUG: search_youtube_videos called with {len(search_terms)} terms", file=sys.stderr)
    all_videos = []
    
    for term in search_terms:
        try:
            print(f"DEBUG: Searching YouTube for: '{term}'", file=sys.stderr)
            # First API call to get video IDs
            search_url = "https://www.googleapis.com/youtube/v3/search"
            search_params = {
                "part": "snippet",
                "q": term,
                "key": YOUTUBE_API_KEY,
                "maxResults": 10,
                "type": "video",
                "relevanceLanguage": language,
                "order": "relevance"
            }
            
            resp = requests.get(search_url, search_params, timeout=10)
            print(f"DEBUG: Search API response status: {resp.status_code}", file=sys.stderr)
            if resp.status_code != 200:
                print(f"ERROR: Search failed with status {resp.status_code}: {resp.text[:200]}", file=sys.stderr)
                continue

            data = resp.json()
            video_ids = [item["id"]["videoId"] for item in data.get("items", [])]
            print(f"DEBUG: Found {len(video_ids)} video IDs", file=sys.stderr)
            
            if not video_ids:
                continue
            
            # Second API call to get statistics and contentDetails
            stats_url = "https://www.googleapis.com/youtube/v3/videos"
            stats_params = {
                "part": "statistics,contentDetails,snippet",
                "id": ",".join(video_ids),
                "key": YOUTUBE_API_KEY
            }
            
            stats_resp = requests.get(stats_url, stats_params, timeout=10)
            print(f"DEBUG: Stats API response status: {stats_resp.status_code}", file=sys.stderr)
            if stats_resp.status_code != 200:
                print(f"ERROR: Stats fetch failed: {stats_resp.text[:200]}", file=sys.stderr)
                continue
            
            stats_data = stats_resp.json()
            print(f"DEBUG: Got {len(stats_data.get('items', []))} items with stats", file=sys.stderr)
            
            # Process and filter videos
            for item in stats_data.get("items", []):
                try:
                    vid = item["id"]
                    views_str = item.get("statistics", {}).get("viewCount", "0")
                    views = int(views_str) if views_str else 0
                    duration = item.get("contentDetails", {}).get("duration", "")
                    title = item["snippet"]["title"]
                    
                    # Parse duration and convert to minutes
                    duration_minutes = parse_iso_duration_to_minutes(duration)
                    print(f"DEBUG: Video '{title[:40]}' - Duration: {duration_minutes}m, Views: {views}", file=sys.stderr)
                    
                    # Apply filters
                    if views >= min_views and duration_minutes >= min_duration_minutes:
                        duration_readable = parse_iso_duration(duration)
                        views_formatted = format_view_count(views)
                        
                        all_videos.append({
                            "title": title,
                            "channel": item["snippet"]["channelTitle"],
                            "url": f"https://www.youtube.com/watch?v={vid}",
                            "views": views_formatted,
                            "duration": duration_readable,
                            "views_raw": views
                        })
                        print(f"DEBUG: ✓ Video added", file=sys.stderr)
                    else:
                        print(f"DEBUG: ✗ Filtered out - Duration: {duration_minutes}m (min: {min_duration_minutes}m), Views: {views} (min: {min_views})", file=sys.stderr)
                except Exception as e:
                    print(f"ERROR: Processing video failed: {e}", file=sys.stderr)
                    pass
                    
        except Exception as e:
            print(f"ERROR: Search for '{term}' failed: {e}", file=sys.stderr)
            pass

    print(f"DEBUG: Total videos collected: {len(all_videos)}", file=sys.stderr)

    # Sort by views (descending) and remove duplicates
    seen_urls = set()
    unique_videos = []
    
    for video in sorted(all_videos, key=lambda x: x["views_raw"], reverse=True):
        if video["url"] not in seen_urls:
            unique_videos.append(video)
            seen_urls.add(video["url"])
            if len(unique_videos) >= 10:  # Fetch best 10 videos
                break
    
    print(f"DEBUG: Returning {len(unique_videos)} unique videos", file=sys.stderr)
    
    # Remove the raw views field before returning
    for video in unique_videos:
        del video["views_raw"]
    
    return unique_videos


def parse_iso_duration(duration):
    """Convert ISO 8601 duration to readable format."""
    # Example: PT1H30M45S -> 1h 30m 45s
    pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
    match = re.match(pattern, duration)
    if not match:
        return ""
    
    hours, minutes, seconds = match.groups()
    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    if seconds:
        parts.append(f"{seconds}s")
    
    return " ".join(parts) if parts else ""


def parse_iso_duration_to_minutes(duration):
    """Convert ISO 8601 duration to total minutes."""
    # Example: PT1H30M45S -> 90.75 minutes
    pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
    match = re.match(pattern, duration)
    if not match:
        return 0
    
    hours, minutes, seconds = match.groups()
    total_minutes = 0
    if hours:
        total_minutes += int(hours) * 60
    if minutes:
        total_minutes += int(minutes)
    if seconds:
        total_minutes += int(seconds) / 60
    
    return total_minutes


def generate_mermaid_chart(target_job, timeline):
    """
    Generate a horizontal Mermaid flowchart (LR layout).
    Shows phases in a horizontal line with skills and projects below each phase.
    """
    lines = [
        "graph LR",
        f'    Start["<b>START</b><br/>{target_job}"]',
        ""
    ]
    
    # Store phase IDs for horizontal connection
    phase_ids = ["Start"]
    
    # Create all phase nodes with their details
    for idx, phase in enumerate(timeline):
        phase_num = idx + 1
        phase_id = f"P{phase_num}"
        
        title = phase.get("title", f"Phase {phase_num}").replace('"', '\\"')[:20]  # Limit title length
        duration = phase.get("duration_weeks", 0)
        
        # Main phase node - clean text without special chars, larger with more spacing
        phase_label = f"Phase {phase_num}<br/>{title}<br/>{duration}w"
        lines.append(f'    {phase_id}["{phase_label}"]')
        phase_ids.append(phase_id)
        
        # Skills node below this phase - clean format
        skills = phase.get("skills", [])
        if skills:
            # Remove special characters, just show skill names
            skills_text = "<br/>".join([f"• {s[:14]}" for s in skills[:6]])  # Show up to 6 skills, limit length
            if len(skills) > 6:
                skills_text += f"<br/>+{len(skills) - 6} more"
            skill_id = f"SK{phase_num}"
            lines.append(f'    {skill_id}["<b>Learn:</b><br/>{skills_text}"]')
            lines.append(f"    {phase_id} --> {skill_id}")
        
        # Projects node below this phase - clean format
        projects = phase.get("projects", [])
        if projects:
            # Remove special characters, just show project names
            projects_text = "<br/>".join([f"◆ {p[:12]}" for p in projects[:5]])  # Show up to 5 projects, limit length
            if len(projects) > 5:
                projects_text += f"<br/>+{len(projects) - 5} more"
            project_id = f"PR{phase_num}"
            lines.append(f'    {project_id}["<b>Build:</b><br/>{projects_text}"]')
            lines.append(f"    {phase_id} --> {project_id}")
        
        lines.append("")
    
    # Connect all phases horizontally in a line
    for i in range(len(phase_ids) - 1):
        lines.append(f"    {phase_ids[i]} --> {phase_ids[i + 1]}")
    
    # Add final completion node - clean format
    lines.append(f'    End["<b>COMPLETE</b><br/>Ready for {target_job[:15]}"]')
    lines.append(f"    {phase_ids[-1]} --> End")
    lines.append("")
    
    # Add styling with larger nodes and fonts
    lines.extend([
        "    classDef startEnd fill:#10b981,stroke:#059669,color:#fff,stroke-width:4px,font-size:16px,font-weight:bold",
        "    classDef phase fill:#3b82f6,stroke:#1e40af,color:#fff,stroke-width:4px,font-size:14px,font-weight:bold",
        "    classDef skills fill:#f59e0b,stroke:#d97706,color:#000,stroke-width:3px,font-size:12px",
        "    classDef projects fill:#8b5cf6,stroke:#6d28d9,color:#fff,stroke-width:3px,font-size:12px",
        "",
        "    class Start,End startEnd",
    ])
    
    # Apply styling dynamically
    if len(timeline) > 0:
        phase_classes = ",".join([f"P{i+1}" for i in range(len(timeline))])
        lines.append(f"    class {phase_classes} phase")
        
        skill_classes = ",".join([f"SK{i+1}" for i in range(len(timeline))])
        lines.append(f"    class {skill_classes} skills")
        
        project_classes = ",".join([f"PR{i+1}" for i in range(len(timeline))])
        lines.append(f"    class {project_classes} projects")
    
    return "\n".join(lines)


def format_view_count(views):
    """Format view count as human-readable (e.g., 1.3M, 500K)."""
    if views >= 1000000:
        # Format as millions (e.g., 1.3M, 2.5M)
        millions = views / 1000000
        if millions >= 10:
            return f"{int(millions)}M"
        else:
            return f"{millions:.1f}M".rstrip('0').rstrip('.')
    elif views >= 1000:
        # Format as thousands (e.g., 500K, 250K)
        thousands = views / 1000
        if thousands >= 100:
            return f"{int(thousands)}K"
        else:
            return f"{thousands:.0f}K"
    else:
        return str(views)


# ===================================================================
# 🔹 Run as Script
# ===================================================================
if __name__ == "__main__":
    try:
        current_skills = json.loads(sys.argv[1])
        target_job = sys.argv[2]
        timeframe_months = int(sys.argv[3])
        additional_context = json.loads(sys.argv[4]) if len(sys.argv) > 4 else None
        mode = sys.argv[5] if len(sys.argv) > 5 else "ai"  # choose "ai" or "youtube"

        print(f"DEBUG: Script called with mode={mode}, len(sys.argv)={len(sys.argv)}", file=sys.stderr)
        print(f"DEBUG: sys.argv={sys.argv}", file=sys.stderr)
        
        if mode == "ai":
            print(f"DEBUG: Calling create_ai_career_timeline", file=sys.stderr)
            result = create_ai_career_timeline(current_skills, target_job, timeframe_months, additional_context)
        else:
            print(f"DEBUG: Calling create_youtube_career_timeline", file=sys.stderr)
            result = create_youtube_career_timeline(current_skills, target_job, timeframe_months, additional_context)

        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
