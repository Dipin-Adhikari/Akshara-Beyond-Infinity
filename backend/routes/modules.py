import os
import random
from fastapi import APIRouter, HTTPException
from database import db
from schemas import UserProgress, GameModuleResponse
from services.adaptive_logic import get_user_level, update_user_performance

router = APIRouter(prefix="/api")

# We don't need to generate audio here anymore because admin.py does it during seeding.
# But we serve the static files via the main app mount.

@router.get("/module/{module_id}/{user_id}", response_model=GameModuleResponse)
async def get_content(module_id: str, user_id: str):
    # 1. Determine User Level
    level = await get_user_level(user_id, module_id)
    
    # 2. Fetch all tasks for this module and level
    content_list = await db.learning_modules.find({
        "module_id": module_id, 
        "level": level
    }).to_list(100)
    
    if not content_list:
        raise HTTPException(status_code=404, detail=f"No content found for module {module_id} at level {level}")

    # 3. Pick a random task
    task = random.choice(content_list)
    
    # 4. Construct Response (Matching GameModuleResponse Schema)
    # The 'content' field in DB already matches the Pydantic Union schema
    return {
        "task_id": str(task["_id"]),
        "module_id": task["module_id"],
        "level": task["level"],
        "epoch": task["epoch"],
        "content": task["content"] # This contains audio_url, choices, target_letter, etc.
    }


@router.post("/report-progress")
async def report(response: UserProgress):
    # Log the attempt
    await db.logs.insert_one(response.model_dump())
    
    # Update adaptive logic (level up/down)
    await update_user_performance(response.user_id, response.is_correct)
    
    return {"status": "success"}