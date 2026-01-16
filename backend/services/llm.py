import json
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

async def generate_stories_from_mistakes(letters: list[str]) -> list[dict]:
    if not letters:
        letters = ["b", "d"] 

    prompt = f"""
    You are a specialized dyslexia tutor for children (6-8 years).
    Create 3 short stories to practice these letters: {letters}.

    Requirements:
    1. **Structure**: Each story must have a 'cover_image_prompt' and exactly 3 'pages' (Chapters).
    2. **Pages**: Each page needs 'text' (2-3 simple sentences) and an 'image_prompt' (visual description for an AI generator).
    3. **Themes**: 
       - Story 1: English (Nepali Village Theme)
       - Story 2: English (Animals/Nature Theme)
       - Story 3: Nepali Language (Simple Folklore)
    4. **Visuals**: Image prompts must be cute, colorful, 3d render style, suitable for children.

    Output STRICT JSON format:
    [
      {{
        "id": 1,
        "title": "The Big Bear",
        "theme": "Animals",
        "cover_image_prompt": "Cute 3d render of a big bear in a forest, sunny day",
        "focus_letters": {json.dumps(letters)},
        "pages": [
           {{ "text": "The bear saw a bee.", "image_prompt": "A bear looking at a bee on a flower, close up, cute 3d render" }},
           {{ "text": "...", "image_prompt": "..." }},
           {{ "text": "...", "image_prompt": "..." }}
        ]
      }},
      ... (Story 2 and 3)
    ]
    """

    try:
        response = await model.generate_content_async(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"GenAI Error: {e}")
        # Fallback Structure
        return [{
            "id": 1, 
            "title": "Error Generating", 
            "theme": "Error", 
            "focus_letters": letters,
            "cover_image_prompt": "Error",
            "pages": [{"text": "Please try again.", "image_prompt": "Error"}]
        }]