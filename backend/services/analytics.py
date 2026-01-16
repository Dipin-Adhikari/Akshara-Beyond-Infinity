from database import db
from collections import Counter

async def get_weak_letters(user_id: str, limit: int = 3) -> list[str]:
    """
    Analyzes logs to find the letters the child struggles with.
    """
    # 1. Fetch recent WRONG attempts
    wrong_logs = await db.logs.find({
        "user_id": user_id, 
        "is_correct": False
    }).sort("timestamp", -1).limit(50).to_list(50)

    if not wrong_logs:
        return []

    # 2. Extract target_letter directly from logs
    # Note: This requires UserProgress to have 'target_letter'
    mistakes = []
    for log in wrong_logs:
        if "target_letter" in log:
            mistakes.append(log["target_letter"])

    if not mistakes:
        return []

    # 3. Count frequencies
    letter_counts = Counter(mistakes)
    
    # Return top 'limit' most frequent incorrect letters (e.g., ['B', 'D'])
    return [letter for letter, count in letter_counts.most_common(limit)]