# evaluation.py

from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re

# ==================================================
# LOAD ENV
# ==================================================
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

# ==================================================
# CLIENT
# ==================================================
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

from utils import extract_json

# ==================================================
# EVALUATE INTERVIEW
# ==================================================
def evaluate_interview(responses):
    formatted_qa = ""
    for idx, item in enumerate(responses):
        formatted_qa += f"\n[Question {idx+1}]: {item.get('question', '')}\n[Candidate Answer]: {item.get('answer', '')}\n"

    prompt = f"""
You are an expert technical interviewer and code reviewer.
Evaluate the candidate's answers to the following questions:

{formatted_qa}

Evaluate:
1. Technical accuracy: Did the candidate use correct terminology and explain concepts accurately?
2. Missing concepts: What key points did they miss?
3. Communication: Was their answer clear, structured, and concise?

Return ONLY a valid JSON object in the following format (do not include any conversational intro/outro text):
{{
  "overall_score": 7.5,
  "overall_feedback": "Summary feedback for the entire interview...",
  "question_evaluations": [
    {{
      "question": "The exact question text",
      "score": 8,
      "feedback": "Feedback details for this answer...",
      "correct_answer": "A detailed model answer representing a correct response to this question."
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="meta-llama/llama-3-8b-instruct",
        messages=[
            {
                "role": "system",
                "content": "You are a professional technical evaluator. You must return only a valid JSON response."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    raw_content = response.choices[0].message.content
    return extract_json(raw_content)
