from fastapi import APIRouter, Query
from database import db
from services.analytics import get_weak_letters
from services.llm import generate_stories_from_mistakes
from services.image_gen import generate_and_save_image
from services.audio_gen import generate_and_save_audio
from schemas import StoryListResponse
from datetime import datetime

router = APIRouter(prefix="/api/stories", tags=["stories"])

@router.get("/{user_id}", response_model=StoryListResponse)
async def get_stories(user_id: str, refresh: bool = Query(False)):
    existing_record = await db.generated_stories.find_one({"user_id": user_id})
    if existing_record and not refresh:
        return existing_record

    # 1. Generate Text
    weak_letters = await get_weak_letters(user_id)
    new_stories = await generate_stories_from_mistakes(weak_letters)
    
    print("Generating Multimedia Assets...")
    
    # 2. Generate Assets
    for story in new_stories:
        # Determine Language for this specific story
        # Default to English if LLM forgets to add the tag
        story_lang = story.get("language", "English")

        # Cover Image
        if "cover_image_prompt" in story:
            story["cover_image_url"] = generate_and_save_image(story["cover_image_prompt"])
        
        # Pages
        if "pages" in story:
            for page in story["pages"]:
                # Generate Image
                if "image_prompt" in page:
                    page["image_url"] = generate_and_save_image(page["image_prompt"])
                
                # Generate Audio (Passing Language!)
                if "text" in page:
                    page["audio_url"] = generate_and_save_audio(page["text"], story_lang)

    # 3. Save to DB
    story_doc = {
        "user_id": user_id,
        "stories": new_stories,
        "generated_at": datetime.utcnow(),
        "focus_letters": weak_letters
    }

    await db.generated_stories.update_one(
        {"user_id": user_id}, 
        {"$set": story_doc}, 
        upsert=True
    )
    
    return story_doc