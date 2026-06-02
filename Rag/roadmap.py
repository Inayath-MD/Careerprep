# roadmap.py

from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from utils import extract_json

# ==================================================
# LOAD ENV & CLIENT
# ==================================================
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

def create_roadmap(weak_topics, role):
    formatted_topics = ", ".join(weak_topics) if weak_topics else "General core subjects"

    # Safely build JSON-compatible list of strings for prompt formatting
    escaped_topics = ", ".join([f'"{t}"' for t in weak_topics]) if weak_topics else ""

    prompt = f"""
You are a senior tech mentor and career guide. 
The candidate is preparing for a {role} position.
Based on their past interview answers, they demonstrated weakness in the following topics:
{formatted_topics}

Generate a personalized, highly structured learning roadmap to help them master these topics.

Return ONLY a valid JSON object in this format (do not include any conversational intro/outro text):
{{
  "role": "{role}",
  "weak_topics_addressed": [{escaped_topics}],
  "roadmap": [
    {{
      "phase": "Phase name (e.g., Phase 1: Foundation)",
      "duration": "Duration (e.g., 1 week)",
      "topics_to_study": ["Concept A", "Concept B"],
      "learning_steps": [
        "Step-by-step description of what to do"
      ],
      "recommended_resources": [
        {{ "name": "Resource Name", "url": "https://..." }}
      ]
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="meta-llama/llama-3-8b-instruct",
        messages=[
            {
                "role": "system",
                "content": "You are a professional tech mentor. You must return only a valid JSON response."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    raw_content = response.choices[0].message.content
    return extract_json(raw_content)
