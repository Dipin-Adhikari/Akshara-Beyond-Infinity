import json
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

async def generate_stories_from_mistakes(letters: list[str]) -> list[dict]:
    if not letters: letters = ["b", "d"] 

    prompt = f"""
    You are an expert Dyslexia Specialist and Children's Storyteller. 
    Your task is to create 3 therapeutic short stories for a child aged 6-12 who struggles with these specific letters/phonemes: {letters}.

    ### THE CORE MISSION
    The child makes mistakes with {letters}. Use these stories for 'Multi-Sensory Repetition'. 
    Incorporate words containing these letters frequently, but keep the sentences readable. 
    For the Nepali story, focus on the Devanagari script versions of these phonetic struggles.

    ### STORY REQUIREMENTS
    1. **Theme**: All stories MUST be based on Nepali Folklore, Festivals (Dashain, Tihar, Holi), or traditional Nepali 'Kathas' (e.g., stories of Birbal, local village fables, or animal fables like the clever jackal).
    2. **Length**: Each story has 3 pages. Each page should have 3-5 clear, meaningful sentences. Not too short to be boring, but not a "wall of text" that overwhelms a dyslexic reader.
    3. **Structure**:
        - Story 1: English (Nepali Folklore theme)
        - Story 2: English (Nepali Village/Animal theme)
        - Story 3: Nepali (Traditional Katha theme) - **Text MUST be in Devanagari script.**

    ### OUTPUT JSON FORMAT (Strictly Follow)
    [
    {{
        "id": 1,
        "language": "English",
        "title": "String",
        "theme": "String",
        "cover_image_prompt": "Whimsical, high-quality 3D render, vibrant colors, child-friendly",
        "focus_letters": {json.dumps(letters)},
        "pages": [
        {{
            "page_number": 1,
            "text": "The story text goes here. Use frequent repetition of {letters}.",
            "image_prompt": "Detailed description for DALL-E/Midjourney relating to this page"
        }},
        ... (exactly 3 pages)
        ]
    }},
    {{
        "id": 3,
        "language": "Nepali",
        "title": "Devanagari Title",
        "theme": "Nepali Folklore",
        "cover_image_prompt": "Traditional Nepali art style, 3D render",
        "focus_letters": {json.dumps(letters)},
        "pages": [
        {{
            "page_number": 1,
            "text": "नेपाली पाठ यहाँ लेख्नुहोस्। Use repetition of {letters}.",
            "image_prompt": "Detailed description for DALL-E relating to this page"
        }},
        ... (exactly 3 pages)
        ]
    }}
    ]
    """

    try:
        response = await model.generate_content_async(
            prompt, generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"LLM Error: {e}")
        return []