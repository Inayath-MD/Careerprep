# utils.py

def chunk_text(
text,
chunk_size=500
):

    chunks = []

    for i in range(
        0,
        len(text),
        chunk_size
    ):

        chunk = text[i:i + chunk_size]

        chunks.append(chunk)

    return chunks


import json
import re

def extract_json(text):
    """Safely extracts and parses JSON from text, ignoring conversational prefixes/suffixes."""
    try:
        # 1. Try standard markdown code block search
        match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
        if match:
            return json.loads(match.group(1).strip())
        
        # 2. Find first [ or { and last ] or }
        start_idx = -1
        end_idx = -1
        for i, char in enumerate(text):
            if char in ('[', '{'):
                start_idx = i
                break
        for i in range(len(text) - 1, -1, -1):
            if text[i] in (']', '}'):
                end_idx = i
                break
        
        if start_idx != -1 and end_idx != -1:
            json_str = text[start_idx:end_idx + 1]
            return json.loads(json_str.strip())
            
        return json.loads(text.strip())
    except Exception as e:
        print("Failed to parse JSON. Raw content:", text)
        raise e

