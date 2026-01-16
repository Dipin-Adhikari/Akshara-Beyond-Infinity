from fastapi import APIRouter, Query, BackgroundTasks
from database import db
from services.analytics import get_weak_letters
from services.llm import generate_stories_from_mistakes
from services.image_gen import generate_and_save_image # New Import
from schemas import StoryListResponse
from datetime import datetime

router = APIRouter(prefix="/api/stories", tags=["stories"])

@router.get("/{user_id}", response_model=StoryListResponse)
async def get_stories(
    user_id: str, 
    refresh: bool = Query(False)
):
    # 1. Return cached if available
    existing_record = await db.generated_stories.find_one({"user_id": user_id})
    if existing_record and not refresh:
        return existing_record

    # 2. Generate Text Content (LLM)
    weak_letters = await get_weak_letters(user_id)
    new_stories = await generate_stories_from_mistakes(weak_letters)
    
    # 3. Generate Images (Synchronous for now to ensure they appear)
    # Note: In production, you might want to do this via BackgroundTasks or a worker
    # But for this use case, we iterate and fill the URLs.
    print("Starting Image Generation...")
    
    for story in new_stories:
        # A. Generate Cover Image
        if "cover_image_prompt" in story:
            story["cover_image_url"] = generate_and_save_image(story["cover_image_prompt"])
        
        # B. Generate Page Images
        if "pages" in story:
            for page in story["pages"]:
                if "image_prompt" in page:
                    page["image_url"] = generate_and_save_image(page["image_prompt"])

    # 4. Save to DB
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