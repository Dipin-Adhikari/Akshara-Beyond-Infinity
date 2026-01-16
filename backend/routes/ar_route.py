import random
from fastapi import APIRouter, HTTPException
from database import db  # Ensure this matches your project structure

# Base URL: /api/modules/ar-hunt
router = APIRouter(prefix="/api/module", tags=["ar-hunt"])

@router.get("/ar-hunt")
async def get_random_ar_task():
    """
    Fetches a single random AR task round.
    Returns 1 Target (Correct) + 3 Distractors (Wrong).
    """
    
    # 1. Fetch ALL AR tasks from the database
    # We need the full set to pick random distractors
    all_tasks = await db.content.find({"module_id": "ar-hunt"}).to_list(length=100)
    
    if not all_tasks:
        raise HTTPException(status_code=404, detail="No AR content found in database.")

    # 2. Pick ONE random Target (The correct answer)
    target_task = random.choice(all_tasks)
    
    # 3. Pick 3 Distractors (Wrong answers)
    # Filter out the target so we don't have duplicates
    potential_distractors = [t for t in all_tasks if t["_id"] != target_task["_id"]]
    
    # Safely sample up to 3 items (or fewer if DB is small)
    count = min(3, len(potential_distractors))
    distractors = random.sample(potential_distractors, count)
    
    # 4. Construct the Options List for the Frontend
    options = []
    
    # Add Target
    options.append({
        "id": str(target_task["_id"]),
        "name": target_task["content"]["target_word"],
        "is_correct": True,
        "image_url": target_task["content"].get("model_3d_url"),
    })
    
    # Add Distractors
    for d in distractors:
        options.append({
            "id": str(d["_id"]),
            "name": d["content"]["target_word"],
            "is_correct": False,
            "image_url": d["content"].get("model_3d_url"),
        })
    
    # Shuffle options so the correct answer isn't always in the same spot
    random.shuffle(options)
    
    # 5. Return the Final Game Data
    return {
        "task_id": str(target_task["_id"]),
        "level": target_task["level"],
        "epoch": target_task["epoch"],
        "prompt": target_task["content"]["prompt_text"],
        "target_word": target_task["content"]["target_word"],
        "audio_url": target_task["content"].get("audio_url"),
        "options": options
    }