from fastapi import APIRouter, HTTPException
from typing import List
import random

router = APIRouter(prefix="/api/modules", tags=["ar-hunt"])

# --------------------------------------------------
# IN-MEMORY AR HUNT DATA (NO DATABASE, NO FILE I/O)
# --------------------------------------------------

AR_HUNT_TASKS = [
    {
        "task_id": "ar_apple",
        "module_id": "ar-hunt",
        "level": 1,
        "epoch": 0,
        "content": {
            "target_word": "Apple",
            "prompt_text": "Can you find the Apple hidden in your room?",
            "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Apple/glTF/Apple.gltf",
            "audio_url": "static/audio/ar_apple.mp3"
        }
    },
    {
        "task_id": "ar_duck",
        "module_id": "ar-hunt",
        "level": 1,
        "epoch": 1,
        "content": {
            "target_word": "Duck",
            "prompt_text": "Look around! Where is the Duck?",
            "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf",
            "audio_url": "static/audio/ar_duck.mp3"
        }
    },
    {
        "task_id": "ar_chair",
        "module_id": "ar-hunt",
        "level": 1,
        "epoch": 2,
        "content": {
            "target_word": "Chair",
            "prompt_text": "Scan the floor to place the Chair!",
            "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF/SheenChair.gltf",
            "audio_url": "static/audio/ar_chair.mp3"
        }
    },
    {
        "task_id": "ar_robot",
        "module_id": "ar-hunt",
        "level": 2,
        "epoch": 0,
        "content": {
            "target_word": "Robot",
            "prompt_text": "Find the Robot walking on the floor!",
            "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SciFiHelmet/glTF/SciFiHelmet.gltf",
            "audio_url": "static/audio/ar_robot.mp3"
        }
    },
    {
        "task_id": "ar_lantern",
        "module_id": "ar-hunt",
        "level": 2,
        "epoch": 1,
        "content": {
            "target_word": "Lantern",
            "prompt_text": "It's dark! Find the Lantern.",
            "model_3d_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF/Lantern.gltf",
            "audio_url": "static/audio/ar_lantern.mp3"
        }
    }
]

# --------------------------------------------------
# GET RANDOM AR HUNT TASK (USED BY FRONTEND)
# --------------------------------------------------

@router.get("/ar-hunt")
async def get_random_ar_task():
    """
    Returns:
    - 1 correct AR object
    - 3 distractors
    """

    if len(AR_HUNT_TASKS) < 2:
        raise HTTPException(status_code=500, detail="Not enough AR Hunt data")

    target_task = random.choice(AR_HUNT_TASKS)

    distractor_pool = [
        t for t in AR_HUNT_TASKS
        if t["task_id"] != target_task["task_id"]
    ]

    distractors = random.sample(
        distractor_pool,
        min(3, len(distractor_pool))
    )

    options = []

    options.append({
        "id": target_task["task_id"],
        "name": target_task["content"]["target_word"],
        "is_correct": True,
        "image_url": target_task["content"].get("model_3d_url")
    })

    for d in distractors:
        options.append({
            "id": d["task_id"],
            "name": d["content"]["target_word"],
            "is_correct": False,
            "image_url": d["content"].get("model_3d_url")
        })

    random.shuffle(options)

    return {
        "task_id": target_task["task_id"],
        "level": target_task["level"],
        "epoch": target_task["epoch"],
        "prompt": target_task["content"]["prompt_text"],
        "target_word": target_task["content"]["target_word"],
        "audio_url": target_task["content"].get("audio_url"),
        "options": options
    }
