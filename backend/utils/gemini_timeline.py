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
    Generate a horizontal Mermaid flowchart (lr layout).
    Shows phases in a horizontal line with skills and projects below each phase.
    """
    # helper to truncate without cutting words in half
    def safe_truncate(text: str, max_len: int) -> str:
        if not text:
            return ""
        text = str(text).strip()
        if len(text) <= max_len:
            return text
        # cut to max_len then backtrack to last space
        cut = text[:max_len]
        last_space = cut.rfind(" ")
        if last_space > max_len // 3:
            return cut[:last_space] + "..."
        return cut.rstrip() + "..."

    # helper to escape characters that break Mermaid when used inside quoted labels
    def escape_label(html: str) -> str:
        if html is None:
            return ""
        s = str(html)
        # escape ampersand first
        s = s.replace('&', '&amp;')
        s = s.replace('"', '&quot;')
        s = s.replace('<', '&lt;')
        s = s.replace('>', '&gt;')
        return s

    # helper to ensure text ends on a complete sentence; if truncated, prefer cutting at sentence boundary
    def complete_sentences(text: str, max_len: int = 300) -> str:
        if not text:
            return ""
        s = str(text).strip()
        # If already short enough and ends with sentence punctuation, return as-is
        if len(s) <= max_len and re.search(r'[\.\!\?]"?\s*$', s):
            return s

        # If short enough but doesn't end with punctuation, append a period
        if len(s) <= max_len:
            return s + ('.' if not s.endswith(('.', '!', '?')) else '')

        # Truncate to max_len and prefer cutting at the last sentence-ending punctuation
        cut = s[:max_len]
        last_punc = max(cut.rfind('.'), cut.rfind('!'), cut.rfind('?'))
        if last_punc != -1 and last_punc > max_len // 3:
            trimmed = cut[: last_punc + 1].strip()
            return trimmed

        # If Gemini model is available, ask it to rewrite into 1-2 complete sentences under max_len
        try:
            if model:
                prompt = (
                    f"Rewrite the following fragment into 1-2 complete, well-formed English sentences"
                    f" without changing the meaning. Keep the result under {max_len} characters.\n\nFragment:\n" + s
                )
                resp = model.generate_content(prompt)
                out = resp.text.strip()
                # If model returned something reasonable, use it (but truncate defensively)
                if out:
                    out = out.replace('\n', ' ').strip()
                    if len(out) > max_len:
                        out = out[:max_len].rstrip()
                        if out[-1] not in '.!?':
                            out += '.'
                    return out
        except Exception:
            # On any failure, fall back to a shorter trimmed fragment
            pass

        # Fallback: trim to last space and append ellipsis, ensure punctuation
        last_space = cut.rfind(' ')
        if last_space > 0:
            trimmed = cut[:last_space].rstrip() + '...'
        else:
            trimmed = cut.rstrip() + '...'
        if trimmed[-1] not in '.!?':
            trimmed += '.'
        return trimmed

    # helper to remove numbered list markers like '1. ', '2) ', '(1) ', at line starts
    def remove_numbered_lists(text: str) -> str:
        if not text:
            return text
        s = str(text)
        # remove markers at start of entire string or after newlines / HTML breaks
        # patterns: '1. ', '1) ', '(1) '
        s = re.sub(r'(?m)^\s*\(?(\d+)\)?[\.\)]\s*', '', s)
        # handle HTML line-breaks followed by numbering
        s = re.sub(r'(<br\s*/?>)\s*\(?(\d+)\)?[\.\)]\s*', r'\1 ', s, flags=re.IGNORECASE)
        return s

    # helper to expand a short description/title into a more detailed paragraph
    # Uses Gemini model if available, otherwise falls back to complete_sentences
    def expand_description(title: str, short_text: str, skills_list=None, projects_list=None, max_len: int = 500) -> str:
        base = (short_text or "").strip()
        # If we already have a reasonably long, well-formed paragraph, prefer it
        if base and len(base) > 200 and re.search(r'[\.\!\?]\s*$', base):
            return base

        prompt_lines = [
            "Expand the following phase into a clear, professional paragraph (2-4 sentences) describing goals, outcomes, and recommended activities.",
            f"Title: {title}",
            f"Short: {base}" if base else "Short: (none)",
        ]
        if skills_list:
            prompt_lines.append("Skills: " + ", ".join(skills_list[:6]))
        if projects_list:
            prompt_lines.append("Projects: " + ", ".join(projects_list[:4]))
        prompt_lines.append(f"Keep the output under {max_len} characters and use complete sentences.")

        prompt = "\n".join(prompt_lines)
        try:
            if model:
                resp = model.generate_content(prompt)
                out = (resp.text or "").strip().replace('\n', ' ')
                if not out:
                    raise ValueError("empty response")
                if len(out) > max_len:
                    out = out[:max_len].rstrip()
                    if out[-1] not in '.!?':
                        out += '.'
                return out
        except Exception:
            # fall through to local fallback
            pass

        # Local fallback: produce a complete sentence version
        if base:
            return complete_sentences(base, max_len=max_len)
        return complete_sentences(title, max_len=max_len)
    # Build start label as clean HTML (min-width) — escape only the dynamic target role
    start_inner = (
        '<div style="min-width:2200px;display:inline-block;text-align:center;">'
        '<div style="font-size:150px; font-weight:800; color:#ffffff;">CAREER JOURNEY START</div>'
        f'<div style="font-size:120px; color:#ffffff; margin-top:12px;">Target Role: {escape_label(safe_truncate(target_job, 60))}</div>'
        '<div style="font-size:120px; color:#ffffff; margin-top:12px;">Your transformation begins now!</div>'
        '</div>'
    )
    lines = [
        "graph LR",
        "    " + f'Start[{start_inner}]',
        ""
    ]
    
    # Store phase IDs for horizontal connection
    phase_ids = ["Start"]
    
    # Create all phase nodes with their details
    for idx, phase in enumerate(timeline):
        phase_num = idx + 1
        phase_id = f"P{phase_num}"
        
        raw_title = phase.get("title", f"Phase {phase_num}")
        # Remove any leading 'Phase N:' or 'PHASE N:' to avoid duplication when we
        # prepend 'PHASE {phase_num}:' below (prevents 'PHASE 2: Phase 2: ...').
        # Remove numbered list markers first (e.g. '1. ', '2) ', '(1) ')
        cleaned_title = remove_numbered_lists(raw_title)
        # Remove any leading 'Phase N:' that may remain after stripping numbers
        cleaned_title = re.sub(r'^phase\s*\d+\s*:?\s*', '', cleaned_title, flags=re.IGNORECASE)
        title = safe_truncate(cleaned_title.replace('"', '\\"'), 60)
        duration = phase.get("duration_weeks", 0)
        # Read skills/projects early so we can include them when expanding descriptions
        skills = phase.get("skills", [])
        projects = phase.get("projects", [])
        raw_description = phase.get("description", "")
        raw_description = remove_numbered_lists(raw_description)
        description = safe_truncate(raw_description, 140) if raw_description else ""

        # Main phase node - use an HTML label with a wide inner div so text wraps horizontally
        # Build an inline-friendly title and description (escaped/truncated)
        title_html = f"<strong>{escape_label(title)}</strong>"
        # Build a detailed description (no duration shown in the phase box)
        desc_plain = expand_description(title, raw_description, skills_list=skills, projects_list=projects, max_len=500)
        desc_html = escape_label(desc_plain.replace('\n', '<br/>'))

        phase_label = (
            f'<div style="min-width:2200px;display:inline-block;text-align:left;white-space:normal;word-break:normal;overflow-wrap:normal;">'
            f'<div style="font-size:150px; margin-bottom:8px; font-weight:700; color:#ffffff!important;">PHASE {phase_num}: {title_html}</div>'
            f'<div style="font-size:150px; color:#ffffff!important;">{desc_html}</div>'
            f'</div>'
        )
        # Use htmlLabels (frontend mermaid init already enables htmlLabels)
        lines.append(f'    {phase_id}["{phase_label}"]')
        phase_ids.append(phase_id)
        
        # Skills node below this phase - clean format without problematic Unicode
        skills = phase.get("skills", [])
        if skills:
            # Render skills inline separated by commas to keep nodes short and wide
            safe_skills = [safe_truncate(remove_numbered_lists(s), 40) for s in skills[:8]]
            skills_inline = ", ".join(safe_skills)
            if len(skills) > 8:
                skills_inline += f", +{len(skills) - 8} more"
            skill_id = f"SK{phase_num}"
            skill_label = (
                f'<div style="min-width:2200px;display:inline-block;text-align:left;white-space:normal;word-break:normal;overflow-wrap:normal;">'
                # Force the Skills heading to white and use 150px
                f'<div style="font-size:150px; font-weight:700; margin-bottom:6px; color:#ffffff!important;">Skills</div>'
                f'<div style="font-size:150px; color:#ffffff!important;">{escape_label(skills_inline)}</div>'
                f'</div>'
            )
            lines.append(f'    {skill_id}["{skill_label}"]')
            lines.append(f"    {phase_id} --> {skill_id}")
        
        # Projects node below this phase - clean format without problematic Unicode
        projects = phase.get("projects", [])
        if projects:
            safe_projects = [safe_truncate(remove_numbered_lists(p), 80) for p in projects[:6]]
            projects_inline = ", ".join(safe_projects)
            if len(projects) > 6:
                projects_inline += f", +{len(projects) - 6} more"
            project_id = f"PR{phase_num}"
            project_label = (
                f'<div style="min-width:2200px;display:inline-block;text-align:left;white-space:normal;word-break:normal;overflow-wrap:normal;">'
                f'<div style="font-size:150px; font-weight:700; margin-bottom:6px; color:#ffffff!important;">Projects</div>'
                f'<div style="font-size:150px; color:#ffffff!important;">{escape_label(projects_inline)}</div>'
                f'</div>'
            )
            lines.append(f'    {project_id}["{project_label}"]')
            lines.append(f"    {phase_id} --> {project_id}")
        
        lines.append("")
    
    # Connect all phases horizontally in a line
    for i in range(len(phase_ids) - 1):
        lines.append(f"    {phase_ids[i]} --> {phase_ids[i + 1]}")
    
    # Add final completion node - larger format (HTML label, escape dynamic text)
    completion_inner = (
        '<div style="min-width:2200px;display:inline-block;text-align:center;">'
        '<div style="font-size:150px; font-weight:800; color:#ffffff;">JOURNEY COMPLETE</div>'
        f'<div style="font-size:120px; color:#ffffff; margin-top:12px;">Ready for {escape_label(safe_truncate(target_job, 60))}</div>'
        '<div style="font-size:120px; color:#ffffff; margin-top:12px;">Congratulations on your achievement!</div>'
        '</div>'
    )
    lines.append("    " + f'End[{completion_inner}]')
    lines.append(f"    {phase_ids[-1]} --> End")
    lines.append("")
    
    # Add styling with larger nodes and fonts (use valid Mermaid classDef properties)
    lines.extend([
        "    classDef startEnd fill:#10b981,stroke:#059669,color:#fff,stroke-width:16px,font-size:150px,font-weight:bold",
        "    classDef phase fill:#3b82f6,stroke:#1e40af,color:#fff,stroke-width:14px,font-size:150px,font-weight:bold",
    # Make the default text color for skills nodes white so inline headings aren't overridden
    "    classDef skills fill:#f59e0b,stroke:#d97706,color:#fff,stroke-width:12px,font-size:150px,font-weight:bold",
        "    classDef projects fill:#8b5cf6,stroke:#6d28d9,color:#fff,stroke-width:12px,font-size:150px,font-weight:bold",
        "",
        "    class Start,End startEnd",
        # Make links/arrows much bolder
        "    linkStyle default stroke-width:22px,stroke:#ffffff,stroke-linecap:round"
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
