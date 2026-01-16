import os
from fastapi import APIRouter, HTTPException
from database import db
# Ensure this imports your updated ContentCreate schema that includes ARHuntTask
from schemas import ContentCreate 

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/seed-ar")
async def seed_ar_only():
    """
    Seeds only the AR Hunt tasks.
    It deletes existing 'ar-hunt' module data first to prevent duplicates,
    but LEAVES other modules (like sound-safari) intact.
    """
    
    # 1. Clean up ONLY existing AR tasks
    await db.content.delete_many({"module_id": "ar-hunt"})

    # 2. Define the AR Curriculum
    ar_curriculum = [
        # --- LEVEL 1: Basic Object Finding ---
        {
            "module_id": "ar-hunt",
            "level": 1,
            "epoch": 0,
            "content": {
                "task_type": "ar_hunt",
                "target_word": "Apple",
                "prompt_text": "Can you find the Apple hidden in your room?",
                "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Apple/glTF/Apple.gltf",
                "audio_url": "static/audio/ar_apple.mp3"
            }
        },
        {
            "module_id": "ar-hunt",
            "level": 1,
            "epoch": 1,
            "content": {
                "task_type": "ar_hunt",
                "target_word": "Duck",
                "prompt_text": "Look around! Where is the Duck?",
                "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf",
                "audio_url": "static/audio/ar_duck.mp3"
            }
        },
        {
            "module_id": "ar-hunt",
            "level": 1,
            "epoch": 2,
            "content": {
                "task_type": "ar_hunt",
                "target_word": "Chair",
                "prompt_text": "Scan the floor to place the Chair!",
                "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF/SheenChair.gltf",
                "audio_url": "static/audio/ar_chair.mp3"
            }
        },

        # --- LEVEL 2: Abstract/Complex Objects ---
        {
            "module_id": "ar-hunt",
            "level": 2,
            "epoch": 0,
            "content": {
                "task_type": "ar_hunt",
                "target_word": "Robot",
                "prompt_text": "Find the Robot walking on the floor!",
                "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SciFiHelmet/glTF/SciFiHelmet.gltf", # Placeholder URL
                "audio_url": "static/audio/ar_robot.mp3"
            }
        },
        {
            "module_id": "ar-hunt",
            "level": 2,
            "epoch": 1,
            "content": {
                "task_type": "ar_hunt",
                "target_word": "Lantern",
                "prompt_text": "It's dark! Find the Lantern.",
                "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF/Lantern.gltf",
                "audio_url": "static/audio/ar_lantern.mp3"
            }
        }
    ]

    validated_data = []

    # 3. Validate and Prepare
    for item in ar_curriculum:
        try:
            # Pydantic will check if 'content' matches ARHuntTask schema 
            # (task_type="ar_hunt", target_word, etc.)
            validated_item = ContentCreate(**item)
            validated_data.append(validated_item.model_dump())
            
        except Exception as e:
            # Returns exact error if your JSON doesn't match ARHuntTask
            raise HTTPException(status_code=400, detail=f"Schema Error on {item.get('target_word', 'Unknown')}: {str(e)}")

    # 4. Insert into DB
    if validated_data:
        await db.content.insert_many(validated_data)

    return {
        "status": "success", 
        "message": f"Seeded {len(validated_data)} AR Hunt tasks.", 
        "details": [t['content']['target_word'] for t in validated_data]
    }