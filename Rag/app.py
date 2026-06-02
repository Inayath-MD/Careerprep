# app.py

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from rag_engine import generate_interview_questions
from ats import generate_ats_score
from evaluation import evaluate_interview

app = FastAPI(title="AI Interview Platform")

# ==================================================

# CORS

# ==================================================

app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

# ==================================================

# HOME ROUTE

# ==================================================

@app.get("/")
def home():
    return {
        "message": "AI Interview Platform Running"
    }

# ==================================================

# GENERATE INTERVIEW

# ==================================================

@app.post("/generate-interview")

async def generate_interview(
file: UploadFile = File(...),
interview_type: str = Form(...),
difficulty: str = Form(...),
num_questions: int = Form(...)
):

    result = await generate_interview_questions(
        file,
        interview_type,
        difficulty ,
        num_questions
    )

    return result

# ==================================================

# ATS SCORE

# ==================================================

@app.post("/ats-score")

async def ats_score(
file: UploadFile = File(...),
job_description: str = Form(None)
):

    result = await generate_ats_score(
        file,
        job_description
    )

    return result


# ==================================================
# EVALUATE ANSWER
# ==================================================

from fastapi import Request

@app.post("/evaluate-interview")
async def evaluate_interview_api(request: Request):
    body = await request.json()
    responses = body.get("responses", [])
    result = evaluate_interview(responses)
    return result


# ==================================================
# GENERATE ROADMAP
# ==================================================
from roadmap import create_roadmap

@app.post("/generate-roadmap")
async def generate_roadmap_api(request: Request):
    body = await request.json()
    weak_topics = body.get("weak_topics", [])
    role = body.get("role", "Developer")
    result = create_roadmap(weak_topics, role)
    return result



