# rag_engine.py

from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from openai import OpenAI
from dotenv import load_dotenv

import faiss
import numpy as np
import os
import json
import re

from utils import chunk_text, extract_json

# ==================================================
# LOAD ENV
# ==================================================

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise ValueError("OPENROUTER_API_KEY not found in .env file")

# ==================================================
# EMBEDDING MODEL
# ==================================================

model = SentenceTransformer("all-MiniLM-L6-v2")

# ==================================================
# OPENROUTER CLIENT
# ==================================================

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

# ==================================================
# CREATE RESUME DIRECTORY
# ==================================================

os.makedirs("resumes", exist_ok=True)

# ==================================================
# GENERATE INTERVIEW QUESTIONS
# ==================================================

async def generate_interview_questions(
    file,
    interview_type,
    difficulty,
    num_questions
):

    try:

        # ==========================================
        # SAVE FILE
        # ==========================================

        file_location = f"resumes/{file.filename}"

        with open(file_location, "wb") as f:
            content = await file.read()
            f.write(content)

        print("PDF saved successfully")

        # ==========================================
        # READ PDF
        # ==========================================

        reader = PdfReader(file_location)

        resume_text = ""

        for page in reader.pages:

            extracted = page.extract_text()

            if extracted:
                resume_text += extracted + "\n"

        print("PDF text extracted")

        # ==========================================
        # CHECK EMPTY RESUME
        # ==========================================

        if not resume_text.strip():

            return {
                "success": False,
                "error": "No text found in resume"
            }

        # ==========================================
        # CHUNKING
        # ==========================================

        chunks = chunk_text(resume_text)

        print(f"Total chunks: {len(chunks)}")

        # ==========================================
        # EMBEDDINGS
        # ==========================================

        embeddings = model.encode(chunks)

        embeddings = np.array(
            embeddings
        ).astype("float32")

        print("Embeddings generated")

        # ==========================================
        # FAISS INDEX
        # ==========================================

        dimension = embeddings.shape[1]

        index = faiss.IndexFlatL2(dimension)

        index.add(embeddings)

        print("FAISS index created")

        # ==========================================
        # QUERY
        # ==========================================

        query = f"""
        Generate {difficulty} level
        {interview_type} interview questions
        """

        # ==========================================
        # QUERY EMBEDDING
        # ==========================================

        query_embedding = model.encode([query])

        query_embedding = np.array(
            query_embedding
        ).astype("float32")

        # ==========================================
        # SEARCH
        # ==========================================

        k = min(5, len(chunks))

        D, I = index.search(
            query_embedding,
            k=k
        )

        print("Similarity search completed")

        # ==========================================
        # RETRIEVE CHUNKS
        # ==========================================

        retrieved_chunks = []

        for idx in I[0]:

            if idx < len(chunks):
                retrieved_chunks.append(chunks[idx])

        context = "\n\n".join(retrieved_chunks)

        print("Relevant chunks retrieved")

        # ==========================================
        # PROMPT
        # ==========================================

        prompt = f"""
You are an expert technical interviewer.

Candidate Resume:
{context}

Interview Type:
{interview_type}

Difficulty:
{difficulty}

Generate exactly {num_questions} interview questions.

Return ONLY valid JSON in this format:

[
{{
"id": 1,
"question": "Question here"
}}
]

Rules:

1. Questions must be personalized
2. Include project-based questions
3. Include scenario-based questions
4. Include technical deep-dive questions
5. Return ONLY JSON
   """


        # ==========================================
        # LLM CALL
        # ==========================================

        response = client.chat.completions.create(
            model="meta-llama/llama-3-8b-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional technical interviewer."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1200
        )

        generated_questions = (
            response
            .choices[0]
            .message
            .content
        )

        questions_json = extract_json(generated_questions)


        print("Questions generated successfully")

        # ==========================================
        # RETURN RESPONSE
        # ==========================================

        return {
            "success": True,
            "interview_type": interview_type,
            "difficulty": difficulty,
            "num_questions": num_questions,
            "questions": questions_json
            }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "success": False,
            "error": str(e)
        }