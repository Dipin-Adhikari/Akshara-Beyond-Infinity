# services/image_gen.py
import os
import requests
import hashlib
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("CLIPDROP_API_KEY")
ENDPOINT = "https://clipdrop-api.co/text-to-image/v1"

# CONFIGURATION
IMAGE_DIR = "images"  # The local folder name
BASE_URL = "http://localhost:8000/images" # The URL prefix

# Ensure directory exists immediately
os.makedirs(IMAGE_DIR, exist_ok=True)

def generate_and_save_image(prompt: str) -> str:
    """
    1. Checks if image for this prompt already exists (using hash).
    2. If not, calls Clipdrop API.
    3. Saves binary data to ./images/hash.png
    4. Returns 'http://localhost:8000/images/hash.png'
    """
    # 1. Fallback for missing key
    if not API_KEY:
        print("Warning: CLIPDROP_API_KEY not set.")
        return "https://placehold.co/600x400?text=No+Key"

    # 2. Generate a unique filename based on the prompt content
    # This acts as a cache. If the prompt is the same, we don't pay for API again.
    prompt_hash = hashlib.md5(prompt.encode()).hexdigest()
    filename = f"{prompt_hash}.png"
    file_path = os.path.join(IMAGE_DIR, filename)
    
    # 3. Check if file already exists locally
    if os.path.exists(file_path):
        print(f"Image found in cache: {filename}")
        return f"{BASE_URL}/{filename}"

    # 4. Call API
    try:
        files = { "prompt": (None, prompt) }
        headers = { "x-api-key": API_KEY }

        response = requests.post(ENDPOINT, files=files, headers=headers)

        if response.status_code == 200:
            # 5. Save file locally
            with open(file_path, "wb") as f:
                f.write(response.content)
            
            print(f"New image saved: {file_path}")
            return f"{BASE_URL}/{filename}"
        else:
            print(f"Clipdrop Error: {response.status_code} - {response.text}")
            return "https://placehold.co/600x400?text=Error"
            
    except Exception as e:
        print(f"Image Gen Exception: {e}")
        return "https://placehold.co/600x400?text=Exception"