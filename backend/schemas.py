from pydantic import BaseModel, Field
from typing import List, Optional, Union, Literal
from datetime import datetime

# --- SHARED BASICS ---
class Choice(BaseModel):
    id: str
    content: str       # Can be a letter "b" or a word "ball"
    type: Literal["text", "image"] # "text" for letters, "image" for Twin Letters
    image_url: Optional[str] = None # Only used if type="image"

# --- 1. SOUND SAFARI (Listen -> Pick Letter) ---
class SoundSafariTask(BaseModel):
    task_type: Literal["sound_safari"] = "sound_safari"
    audio_url: str
    target_letter: str
    choices: List[Choice] 

# --- 2. WORD BUILDER (Image/Sound -> Drag Letters to make word) ---
class WordBuilderTask(BaseModel):
    task_type: Literal["word_builder"] = "word_builder"
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    target_word: str       # e.g., "CAT"
    scrambled_letters: List[Choice] # e.g., [T, C, A, B]

# --- 3. SOUND SLICER (Word -> Split into phonemes) ---
class SoundSlicerTask(BaseModel):
    task_type: Literal["sound_slicer"] = "sound_slicer"
    word_text: str         # e.g., "CAT"
    audio_url: str         # Audio of "Cat"
    correct_segments: List[str] # ["C", "A", "T"] (For validation)

# --- 4. TWIN LETTERS (Letter -> Pick Image) ---
class TwinLettersTask(BaseModel):
    task_type: Literal["twin_letters"] = "twin_letters"
    target_letter: str     # e.g., "b"
    audio_url: Optional[str] = None # "buh" sound
    choices: List[Choice]  # These will be images (ball, bat, apple)

# --- MASTER UNION (The API Response) ---
class GameModuleResponse(BaseModel):
    task_id: str
    module_id: str
    level: int
    epoch: int
    # This 'content' field can be ANY of the specific tasks above
    content: Union[SoundSafariTask, WordBuilderTask, SoundSlicerTask, TwinLettersTask]

# --- DB SEEDING SCHEMA ---
class ContentCreate(BaseModel):
    module_id: str
    level: int
    epoch: int
    # We use the same Union here so we can seed different types
    content: Union[SoundSafariTask, WordBuilderTask, SoundSlicerTask, TwinLettersTask]

# --- EXISTING ANALYTICS (Unchanged) ---
class UserProgress(BaseModel):
    user_id: str
    module_id: str
    level: int
    epoch: int
    selected_id: str
    is_correct: bool
    response_time_ms: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- EXISTING STORY SCHEMAS (Unchanged) ---
class StoryPage(BaseModel):
    text: str
    image_prompt: str
    image_url: Optional[str] = None # Filled after generation

class Story(BaseModel):
    id: int 
    title: str
    theme: str 
    cover_image_prompt: str
    cover_image_url: Optional[str] = None
    focus_letters: List[str]
    pages: List[StoryPage] # The story is now split into chapters

class StoryListResponse(BaseModel):
    stories: List[Story]
    generated_at: datetime = Field(default_factory=datetime.utcnow)