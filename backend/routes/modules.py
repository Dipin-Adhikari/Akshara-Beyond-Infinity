import os
import random
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
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


# ===== SOUND SAFARI MODULE =====
@router.get("/modules/sound-safari/{user_id}")
async def get_sound_safari_module(user_id: str):
    """Get Sound Safari module information and current progress"""
    
    # Get user's Sound Safari progress from logs
    sound_safari_logs = await db.logs.find({
        "user_id": user_id,
        "module": "Sound Safari"
    }).to_list(100)
    
    total_attempts = len(sound_safari_logs)
    correct_attempts = len([log for log in sound_safari_logs if log.get("correct", False)])
    
    return {
        "module_id": "sound-safari",
        "name": "Sound Safari",
        "emoji": "🦁",
        "description": "Interactive audio-based learning for phonics and sound recognition",
        "type": "Audio",
        "attempts": total_attempts,
        "correct": correct_attempts,
        "incorrect": total_attempts - correct_attempts,
        "accuracy": (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0,
        "status": "active"
    }


# ===== TWIN LETTERS AR MODULE =====
@router.get("/modules/twin-letters-ar/{user_id}")
async def get_twin_letters_ar_module(user_id: str):
    """Get Twin Letters AR module information and current progress"""
    
    # Get user's Twin Letters AR progress from logs
    twin_letters_logs = await db.logs.find({
        "user_id": user_id,
        "module": "Twin Letters AR"
    }).to_list(100)
    
    total_attempts = len(twin_letters_logs)
    correct_attempts = len([log for log in twin_letters_logs if log.get("correct", False)])
    
    return {
        "module_id": "twin-letters-ar",
        "name": "Twin Letters AR",
        "emoji": "📱",
        "description": "Augmented reality-based letter pair recognition and matching exercises",
        "type": "Augmented Reality",
        "attempts": total_attempts,
        "correct": correct_attempts,
        "incorrect": total_attempts - correct_attempts,
        "accuracy": (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0,
        "status": "active"
    }


# ===== GET ALL MODULES INFO =====
@router.get("/modules/all/{user_id}")
async def get_all_modules(user_id: str):
    """Get all available modules with their progress"""
    
    sound_safari = await get_sound_safari_module(user_id)
    twin_letters = await get_twin_letters_ar_module(user_id)
    
    return {
        "modules": [sound_safari, twin_letters],
        "total_modules": 2
    }


# ===== CREATE/ADD SOUND SAFARI MODULE =====
@router.post("/modules/sound-safari/add")
async def add_sound_safari_module(user_id: str = Query(..., description="User ID")):
    """Add Sound Safari module to user's learningModules"""
    
    try:
        # Check if module already exists
        existing = await db.learning_modules.find_one({
            "user_id": user_id,
            "module_id": "sound_safari"
        })
        
        if existing:
            return {
                "status": "already_exists",
                "module_id": "sound_safari",
                "name": "Sound Safari",
                "emoji": "🦁",
                "message": "Sound Safari already added to this user"
            }
        
        # Add new Sound Safari module entry
        module_entry = {
            "user_id": user_id,
            "module_id": "sound_safari",
            "name": "Sound Safari",
            "emoji": "🦁",
            "description": "Interactive audio-based learning for phonics and sound recognition",
            "type": "Audio",
            "level": 1,
            "status": "active",
            "added_at": datetime.utcnow(),
            "attempts": 0,
            "correct": 0
        }
        
        result = await db.learning_modules.insert_one(module_entry)
        
        return {
            "status": "success",
            "module_id": "sound_safari",
            "name": "Sound Safari",
            "emoji": "🦁",
            "message": "Sound Safari module added successfully",
            "user_id": user_id
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# ===== CREATE/ADD TWIN LETTERS AR MODULE =====
@router.post("/modules/twin-letters-ar/add")
async def add_twin_letters_ar_module(user_id: str = Query(..., description="User ID")):
    """Add Twin Letters AR module to user's learningModules"""
    
    try:
        # Check if module already exists
        existing = await db.learning_modules.find_one({
            "user_id": user_id,
            "module_id": "twin_letters"
        })
        
        if existing:
            return {
                "status": "already_exists",
                "module_id": "twin_letters",
                "name": "Twin Letters AR",
                "emoji": "📱",
                "message": "Twin Letters AR already added to this user"
            }
        
        # Add new Twin Letters AR module entry
        module_entry = {
            "user_id": user_id,
            "module_id": "twin_letters",
            "name": "Twin Letters AR",
            "emoji": "📱",
            "description": "Augmented reality-based letter pair recognition and matching exercises",
            "type": "Augmented Reality",
            "level": 1,
            "status": "active",
            "added_at": datetime.utcnow(),
            "attempts": 0,
            "correct": 0
        }
        
        result = await db.learning_modules.insert_one(module_entry)
        
        return {
            "status": "success",
            "module_id": "twin_letters",
            "name": "Twin Letters AR",
            "emoji": "📱",
            "message": "Twin Letters AR module added successfully",
            "user_id": user_id
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }