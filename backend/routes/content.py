from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import db
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/content", tags=["content"])

# Pydantic models
class SoundData(BaseModel):
    word: str
    sound: str
    difficulty: str = "easy"
    category: str = "animals"

class LetterData(BaseModel):
    letterPair: str
    description: str = ""
    difficulty: str = "easy"
    imageUrl: Optional[str] = None

# Sound Safari Endpoints
@router.post("/sounds")
async def add_sound(sound_data: SoundData):
    """Add a new sound to Sound Safari module"""
    
    try:
        # Create sound document
        sound_doc = {
            "word": sound_data.word.lower(),
            "sound": sound_data.sound,
            "difficulty": sound_data.difficulty,
            "category": sound_data.category,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        # Insert into sounds collection
        result = await db.sounds.insert_one(sound_doc)
        
        return {
            "id": str(result.inserted_id),
            "message": f"Sound '{sound_data.word}' added successfully",
            "sound": sound_doc
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding sound: {str(e)}")


@router.get("/sounds")
async def get_sounds(category: Optional[str] = None, difficulty: Optional[str] = None):
    """Get all sounds, optionally filtered by category and difficulty"""
    
    try:
        query = {"is_active": True}
        
        if category:
            query["category"] = category
        if difficulty:
            query["difficulty"] = difficulty
        
        sounds = await db.sounds.find(query).to_list(1000)
        
        return {
            "total": len(sounds),
            "sounds": [
                {
                    "id": str(sound["_id"]),
                    "word": sound["word"],
                    "sound": sound["sound"],
                    "difficulty": sound["difficulty"],
                    "category": sound["category"],
                    "created_at": sound.get("created_at").isoformat() if sound.get("created_at") else None
                }
                for sound in sounds
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sounds: {str(e)}")


@router.delete("/sounds/{sound_id}")
async def delete_sound(sound_id: str):
    """Deactivate a sound (soft delete)"""
    
    try:
        from bson import ObjectId
        
        result = await db.sounds.update_one(
            {"_id": ObjectId(sound_id)},
            {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Sound not found")
        
        return {"message": "Sound deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting sound: {str(e)}")


# Twin Letters AR Endpoints
@router.post("/letters")
async def add_letter_pair(letter_data: LetterData):
    """Add a new letter pair to Twin Letters AR module"""
    
    try:
        # Create letter pair document
        letter_doc = {
            "letterPair": letter_data.letterPair.upper(),
            "description": letter_data.description,
            "difficulty": letter_data.difficulty,
            "imageUrl": letter_data.imageUrl,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        # Insert into letter_pairs collection
        result = await db.letter_pairs.insert_one(letter_doc)
        
        return {
            "id": str(result.inserted_id),
            "message": f"Letter pair '{letter_data.letterPair}' added successfully",
            "letter": letter_doc
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding letter pair: {str(e)}")


@router.get("/letters")
async def get_letters(difficulty: Optional[str] = None):
    """Get all letter pairs, optionally filtered by difficulty"""
    
    try:
        query = {"is_active": True}
        
        if difficulty:
            query["difficulty"] = difficulty
        
        letters = await db.letter_pairs.find(query).to_list(1000)
        
        return {
            "total": len(letters),
            "letters": [
                {
                    "id": str(letter["_id"]),
                    "letterPair": letter["letterPair"],
                    "description": letter["description"],
                    "difficulty": letter["difficulty"],
                    "imageUrl": letter.get("imageUrl"),
                    "created_at": letter.get("created_at").isoformat() if letter.get("created_at") else None
                }
                for letter in letters
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching letter pairs: {str(e)}")


@router.delete("/letters/{letter_id}")
async def delete_letter(letter_id: str):
    """Deactivate a letter pair (soft delete)"""
    
    try:
        from bson import ObjectId
        
        result = await db.letter_pairs.update_one(
            {"_id": ObjectId(letter_id)},
            {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Letter pair not found")
        
        return {"message": "Letter pair deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting letter pair: {str(e)}")


# Content Statistics Endpoints
@router.get("/stats")
async def get_content_stats():
    """Get statistics about added content"""
    
    try:
        total_sounds = await db.sounds.count_documents({"is_active": True})
        total_letters = await db.letter_pairs.count_documents({"is_active": True})
        
        sounds_by_difficulty = {}
        for difficulty in ["easy", "medium", "hard"]:
            count = await db.sounds.count_documents({"is_active": True, "difficulty": difficulty})
            sounds_by_difficulty[difficulty] = count
        
        letters_by_difficulty = {}
        for difficulty in ["easy", "medium", "hard"]:
            count = await db.letter_pairs.count_documents({"is_active": True, "difficulty": difficulty})
            letters_by_difficulty[difficulty] = count
        
        return {
            "sounds": {
                "total": total_sounds,
                "by_difficulty": sounds_by_difficulty
            },
            "letters": {
                "total": total_letters,
                "by_difficulty": letters_by_difficulty
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
