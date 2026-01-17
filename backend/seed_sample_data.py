"""
Seed sample learning data for testing the dashboard
"""
import asyncio
from datetime import datetime, timedelta
from database import db

async def seed_sample_data():
    USER_ID = "child_123"  # Default test user
    
    # Clear existing logs for this user
    await db.logs.delete_many({"user_id": USER_ID})
    
    # Create sample logs for different modules
    sample_logs = [
        # Sound Safari (Phonic Issues)
        {"user_id": USER_ID, "module_id": "sound_safari", "module": "Sound Safari", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=5), "response_time_ms": 2500},
        {"user_id": USER_ID, "module_id": "sound_safari", "module": "Sound Safari", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=4), "response_time_ms": 2100},
        {"user_id": USER_ID, "module_id": "sound_safari", "module": "Sound Safari", "is_correct": False, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=3), "response_time_ms": 3200},
        {"user_id": USER_ID, "module_id": "sound_safari", "module": "Sound Safari", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=2), "response_time_ms": 1800},
        
        # Sound Slicer (Phonic Issues)
        {"user_id": USER_ID, "module_id": "sound_slicer", "module": "Sound Slicer", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=6), "response_time_ms": 2800},
        {"user_id": USER_ID, "module_id": "sound_slicer", "module": "Sound Slicer", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=1), "response_time_ms": 2200},
        
        # Word Builder (Vocabulary & Comprehension)
        {"user_id": USER_ID, "module_id": "word_builder", "module": "Word Builder", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(days=1), "response_time_ms": 3500},
        {"user_id": USER_ID, "module_id": "word_builder", "module": "Word Builder", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=8), "response_time_ms": 3100},
        {"user_id": USER_ID, "module_id": "word_builder", "module": "Word Builder", "is_correct": False, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=7), "response_time_ms": 4200},
        
        # Twin Letters (Writing Issues)
        {"user_id": USER_ID, "module_id": "twin_letters", "module": "Twin Letters AR", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(days=1, hours=2), "response_time_ms": 4000},
        {"user_id": USER_ID, "module_id": "twin_letters", "module": "Twin Letters AR", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=12), "response_time_ms": 3600},
        {"user_id": USER_ID, "module_id": "twin_letters", "module": "Twin Letters AR", "is_correct": False, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=11), "response_time_ms": 5100},
        {"user_id": USER_ID, "module_id": "twin_letters", "module": "Twin Letters AR", "is_correct": True, "level": 1, "timestamp": datetime.utcnow() - timedelta(hours=10), "response_time_ms": 3800},
    ]
    
    # Insert sample logs
    if sample_logs:
        result = await db.logs.insert_many(sample_logs)
        print(f"✅ Seeded {len(sample_logs)} sample log entries for user: {USER_ID}")
        return len(sample_logs)
    
    return 0

if __name__ == "__main__":
    count = asyncio.run(seed_sample_data())
    print(f"Total logs created: {count}")
