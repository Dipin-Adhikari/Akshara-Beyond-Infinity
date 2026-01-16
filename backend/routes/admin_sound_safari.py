import os
from fastapi import APIRouter, HTTPException
from gtts import gTTS
from database import db
from schemas import ContentCreate # Use the new Input Schema

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/seed")
async def seed_data():
    await db.content.delete_many({})

    raw_curriculum = [
        # =====================
        # LEVEL 1 – Phoneme–Grapheme Mapping
        # =====================
        {
            "module_id": "sound-safari",
            "level": 1,
            "epoch": 0,
            "target_letter": "b",
            "phonic_sound": "ba",
            "choices": [
                {"id": "0", "letter": "b"},
                {"id": "1", "letter": "d"},
                {"id": "2", "letter": "v"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 1,
            "epoch": 1,
            "target_letter": "f",
            "phonic_sound": "fa",
            "choices": [
                {"id": "0", "letter": "f"},
                {"id": "1", "letter": "v"},
                {"id": "2", "letter": "p"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 1,
            "epoch": 2,
            "target_letter": "s",
            "phonic_sound": "sa",
            "choices": [
                {"id": "0", "letter": "s"},
                {"id": "1", "letter": "c"},
                {"id": "2", "letter": "z"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 1,
            "epoch": 3,
            "target_letter": "m",
            "phonic_sound": "ma",
            "choices": [
                {"id": "0", "letter": "m"},
                {"id": "1", "letter": "n"},
                {"id": "2", "letter": "w"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 1,
            "epoch": 4,
            "target_letter": "t",
            "phonic_sound": "ta",
            "choices": [
                {"id": "0", "letter": "t"},
                {"id": "1", "letter": "d"},
                {"id": "2", "letter": "k"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 1,
            "epoch": 5,
            "target_letter": "p",
            "phonic_sound": "pa",
            "choices": [
                {"id": "0", "letter": "p"},
                {"id": "1", "letter": "b"},
                {"id": "2", "letter": "k"}
            ]
        },

        # =====================
        # LEVEL 2 – Sound Blending & Discrimination
        # =====================
        {
            "module_id": "sound-safari",
            "level": 2,
            "epoch": 0,
            "target_letter": "bra",
            "phonic_sound": "bra",
            "choices": [
                {"id": "0", "letter": "bra"},
                {"id": "1", "letter": "bara"},
                {"id": "2", "letter": "dra"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 2,
            "epoch": 1,
            "target_letter": "pla",
            "phonic_sound": "pla",
            "choices": [
                {"id": "0", "letter": "pla"},
                {"id": "1", "letter": "pa"},
                {"id": "2", "letter": "bla"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 2,
            "epoch": 2,
            "target_letter": "sta",
            "phonic_sound": "sta",
            "choices": [
                {"id": "0", "letter": "sta"},
                {"id": "1", "letter": "sata"},
                {"id": "2", "letter": "ska"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 2,
            "epoch": 3,
            "target_letter": "tra",
            "phonic_sound": "tra",
            "choices": [
                {"id": "0", "letter": "tra"},
                {"id": "1", "letter": "tara"},
                {"id": "2", "letter": "dra"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 2,
            "epoch": 4,
            "target_letter": "kla",
            "phonic_sound": "kla",
            "choices": [
                {"id": "0", "letter": "kla"},
                {"id": "1", "letter": "ka"},
                {"id": "2", "letter": "gla"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 2,
            "epoch": 5,
            "target_letter": "spla",
            "phonic_sound": "spla",
            "choices": [
                {"id": "0", "letter": "spla"},
                {"id": "1", "letter": "spa"},
                {"id": "2", "letter": "bla"}
            ]
        },

        # =====================
        # LEVEL 3 – Phonological Discrimination
        # =====================
        {
            "module_id": "sound-safari",
            "level": 3,
            "epoch": 0,
            "target_letter": "bat",
            "phonic_sound": "bat",
            "choices": [
                {"id": "0", "letter": "bat"},
                {"id": "1", "letter": "pat"},
                {"id": "2", "letter": "bad"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 3,
            "epoch": 1,
            "target_letter": "fan",
            "phonic_sound": "fan",
            "choices": [
                {"id": "0", "letter": "fan"},
                {"id": "1", "letter": "van"},
                {"id": "2", "letter": "pan"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 3,
            "epoch": 2,
            "target_letter": "sip",
            "phonic_sound": "sip",
            "choices": [
                {"id": "0", "letter": "sip"},
                {"id": "1", "letter": "zip"},
                {"id": "2", "letter": "ship"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 3,
            "epoch": 3,
            "target_letter": "cap",
            "phonic_sound": "cap",
            "choices": [
                {"id": "0", "letter": "cap"},
                {"id": "1", "letter": "cab"},
                {"id": "2", "letter": "gap"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 3,
            "epoch": 4,
            "target_letter": "ten",
            "phonic_sound": "ten",
            "choices": [
                {"id": "0", "letter": "ten"},
                {"id": "1", "letter": "den"},
                {"id": "2", "letter": "pen"}
            ]
        },
        {
            "module_id": "sound-safari",
            "level": 3,
            "epoch": 5,
            "target_letter": "map",
            "phonic_sound": "map",
            "choices": [
                {"id": "0", "letter": "map"},
                {"id": "1", "letter": "nap"},
                {"id": "2", "letter": "mat"}
            ]
        }
    ]



    validated_curriculum = []
    for item in raw_curriculum:
        try:
            # Validate against ContentCreate (No task_id or audio_url required here)
            validated_item = ContentCreate(**item)
            
            # gTTS check
            temp_file = f"test_{validated_item.target_letter}.mp3"
            gTTS(text=validated_item.phonic_sound, lang='en').save(temp_file)
            if os.path.exists(temp_file): os.remove(temp_file)

            validated_curriculum.append(validated_item.model_dump()) # Use .dict() if using older pydantic
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Validation Error: {str(e)}")

    await db.content.insert_many(validated_curriculum)
    return {"message": f"Seeded {len(validated_curriculum)} items successfully."}