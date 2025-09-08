import os
import json
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables!")
        genai.configure(api_key=self.api_key)

    def generate_langgraph_career_plan(
        self, current_skills: List[str], target_role: str, timeframe_months: int = 6
    ) -> Dict[str, Any]:
        """
        Generate a structured LangGraph JSON career plan using Gemini.
        """
        skills_text = ", ".join(current_skills)
        prompt = f"""
You are an AI career planner.
Generate a structured {timeframe_months}-month career plan for becoming a {target_role}.
The user already knows {skills_text}.

Return output strictly in the following JSON format for LangGraph:
{{
  "nodes": [
    {{ "id": "unique_id", "label": "Step Name", "type": "task" }}
  ],
  "edges": [
    {{ "source": "id1", "target": "id2", "label": "prerequisite" }}
  ]
}}
"""
        try:
            response = genai.responses.create(
                model="gemini-2.5-flash",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )
            return json.loads(response.output_text)
        except Exception as e:
            print(f"Error generating LangGraph career plan: {e}")
            return {}

if __name__ == "__main__":
    service = GeminiService()

    user_skills = ["Python", "SQL", "Data Analysis"]
    target_job = "Machine Learning Engineer"

    plan = service.generate_langgraph_career_plan(
        current_skills=user_skills,
        target_role=target_job,
        timeframe_months=6
    )

    if plan:
        print("Generated LangGraph JSON:\n")
        print(json.dumps(plan, indent=2))

        # Save to file
        output_file = "career_plan_langgraph.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(plan, f, indent=2)
        print(f"\nSaved LangGraph JSON to {output_file}")
    else:
        print("Failed to generate LangGraph career plan.")
