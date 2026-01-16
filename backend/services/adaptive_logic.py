from database import db

async def get_user_level(user_id: str, module_id: str) -> int:
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        await db.users.insert_one({"user_id": user_id, "current_level": 1})
        return 1
    return user.get("current_level", 1)

async def update_user_performance(user_id: str, is_correct: bool):
    if is_correct:
        # Check last 5 attempts
        history = await db.logs.find({"user_id": user_id})\
                              .sort("timestamp", -1)\
                              .limit(5).to_list(5)
        
        correct_streak = sum(1 for log in history if log["is_correct"])
        
        if correct_streak >= 4: # If 4 out of 5 are correct, level up
            await db.users.update_one({"user_id": user_id}, {"$inc": {"current_level": 1}})