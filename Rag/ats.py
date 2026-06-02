# ats.py

from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from openai import OpenAI
from dotenv import load_dotenv

import os
import json
import re

# ==================================================
# LOAD ENV & CLIENT
# ==================================================
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

# ==================================================
# MODEL FOR COSINE SIMILARITY
# ==================================================
model = SentenceTransformer("all-MiniLM-L6-v2")

from utils import extract_json

# ==================================================
# ATS SCORE
# ==================================================
async def generate_ats_score(file, job_description=None):
    try:
        # ==========================================
        # SAVE FILE
        # ==========================================
        os.makedirs("resumes", exist_ok=True)
        file_location = f"resumes/{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # ==========================================
        # READ PDF
        # ==========================================
        reader = PdfReader(file_location)
        resume_text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                resume_text += extracted + "\n"

        if not resume_text.strip():
            return {
                "success": False,
                "error": "No text found in resume"
            }

        # ==========================================
        # DYNAMIC LLM EVALUATION
        # ==========================================
        if job_description and job_description.strip():
            prompt = f"""
Candidate Resume:
{resume_text}

Job Description:
{job_description}

You are an expert ATS (Applicant Tracking System) evaluator. 
Perform a deep analysis of the resume against the job description.
Extract all professional skills from the resume. Identify which skills are present, which required skills are missing, and calculate an overall matching score from 0 to 100.

Return ONLY a valid JSON object in this format (do not include any conversational intro/outro text):
{{
  "overall_ats_score": 85.0,
  "detected_skills": ["java", "spring boot", "mysql"],
  "missing_skills": ["docker", "kubernetes"],
  "feedback": "Your resume has a strong match. We recommend adding docker and kubernetes experience if you have it."
}}
"""
        else:
            prompt = f"""
Candidate Resume:
{resume_text}

You are an expert resume reviewer. 
Perform a deep analysis of the resume. Extract all professional skills listed. 
Assess the resume formatting, description metrics, and overall quality. Calculate an overall rating from 0 to 100.

Return ONLY a valid JSON object in this format (do not include any conversational intro/outro text):
{{
  "overall_ats_score": 75.0,
  "detected_skills": ["java", "spring boot", "mysql"],
  "missing_skills": [],
  "feedback": "Overall resume score is 75. Recommended to add more metrics and quantify your project descriptions."
}}
"""

        response = client.chat.completions.create(
            model="meta-llama/llama-3-8b-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional ATS reviewer. You must return only a valid JSON response."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        raw_content = response.choices[0].message.content
        result = extract_json(raw_content)
        result["success"] = True

        # ==========================================
        # OPTIONAL: COSINE SIMILARITY EMBEDDING MATCH
        # ==========================================
        if job_description and job_description.strip():
            embeddings = model.encode([resume_text, job_description])
            similarity = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]) * 100
            result["job_match_score"] = round(similarity, 2)
        else:
            result["job_match_score"] = 0.0

        return result

    except Exception as e:
        print("ATS ERROR:", str(e))
        return {
            "success": False,
            "error": str(e)
        }
