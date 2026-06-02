FROM python:3.10-slim

WORKDIR /app

# Install build dependencies for package compatibility (like numpy, faiss)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
# Install CPU-only PyTorch to reduce image size and download time significantly
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
# Install remaining dependencies with extended timeout
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt


# Copy the rest of the RAG application files
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Start FastAPI using uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
