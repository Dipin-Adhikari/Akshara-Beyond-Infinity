import base64
import io
import os
import json
import math
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import List, Optional

# FastAPI & Pydantic
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Image Processing
from PIL import Image, ImageOps, ImageFilter
from torchvision import transforms

# AI
import google.generativeai as genai
from dotenv import load_dotenv

# ==========================================
# 0. CONFIGURATION & SETUP
# ==========================================

# 1. Load Environment Variables
load_dotenv()

# 2. Configure Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("⚠️ WARNING: GOOGLE_API_KEY not found in .env file.")
else:
    genai.configure(api_key=GOOGLE_API_KEY)

# 3. Router Setup
router = APIRouter(prefix="/api/test", tags=["test"])
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 4. Model Paths (Update these to your actual paths)
ENGLISH_MODEL_PATH = r"D:\Akshara\backend\models\emnist_26_best.pth"
NEPALI_MODEL_PATH = r"D:\Akshara\backend\models\best_devanagari_model.pth"

# ==========================================
# 1. CURRICULUM (Updated)
# ==========================================
# Note: Ensure these .mp3 files exist in your 'audio' folder.

CURRICULUM = [
    # --- English Writing (Listen -> Write) ---
    { 
        "id": 1, 
        "type": "writing", 
        "lang": "english", 
        "target": "b", 
        "audio_filename": "en_b.mp3",
        "instruction": "Listen to the sound and write the letter." 
    },
    { 
        "id": 2, 
        "type": "writing", 
        "lang": "english", 
        "target": "d", 
        "audio_filename": "en_d.mp3", 
        "instruction": "Listen to the sound and write the letter." 
    },
    { 
        "id": 3, 
        "type": "writing", 
        "lang": "english", 
        "target": "p", 
        "audio_filename": "en_p.mp3", 
        "instruction": "Listen to the sound and write the letter." 
    },
    { 
        "id": 4, 
        "type": "writing", 
        "lang": "english", 
        "target": "u", 
        "audio_filename": "en_u.mp3", 
        "instruction": "Listen to the sound and write the letter." 
    },
    { 
        "id": 5, 
        "type": "writing", 
        "lang": "english", 
        "target": "s", 
        "audio_filename": "en_s.mp3", 
        "instruction": "Listen to the sound and write the letter." 
    },

    # --- Nepali Writing (Listen -> Write) ---
    # Testing specific confusion pairs: ब/व, त/न, द/ध, क/फ
    { 
        "id": 6, 
        "type": "writing", 
        "lang": "nepali", 
        "target": "ka", 
        "audio_filename": "ne_ka.m4a", 
        "instruction": "आवाज सुन्नुहोस् र अक्षर लेख्नुहोस्।" 
    },
    { 
        "id": 7, 
        "type": "writing", 
        "lang": "nepali", 
        "target": "ba", 
        "audio_filename": "ne_ba.m4a", 
        "instruction": "आवाज सुन्नुहोस् र अक्षर लेख्नुहोस्।" 
    },
    { 
        "id": 8, 
        "type": "writing", 
        "lang": "nepali", 
        "target": "da", 
        "audio_filename": "ne_da.m4a", 
        "instruction": "आवाज सुन्नुहोस् र अक्षर लेख्नुहोस्।" 
    },
    { 
        "id": 9, 
        "type": "writing", 
        "lang": "nepali", 
        "target": "ma", 
        "audio_filename": "ne_ma.m4a", 
        "instruction": "आवाज सुन्नुहोस् र अक्षर लेख्नुहोस्।" 
    },

    # --- English Speaking (Read Aloud) ---
    { 
        "id": 10, 
        "type": "speaking", 
        "lang": "english", 
        "target": "The big black dog dug a deep dark ditch.", 
        "content": "Read this sentence aloud:" 
    },
    { 
        "id": 11, 
        "type": "speaking", 
        "lang": "english", 
        "target": "She saw six slim snakes slide slowly.", 
        "content": "Read this sentence aloud:" 
    },

    # --- Nepali Speaking (Read Aloud) ---
    { 
        "id": 12, 
        "type": "speaking", 
        "lang": "nepali", 
        "target": "दिनदिनै नदी नजिक नानी नाचिन्।", 
        "content": "यो वाक्य पढ्नुहोस्:" 
    },
    { 
        "id": 13, 
        "type": "speaking", 
        "lang": "nepali", 
        "target": "बाबुले धेरै भारी बोरा बोके।", 
        "content": "यो वाक्य पढ्नुहोस्:" 
    },
]

# ==========================================
# 2. PYTORCH MODELS
# ==========================================

# --- English Model (EMNIST) ---
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.3)
        self.fc1 = nn.Linear(64 * 7 * 7, 256)
        self.fc2 = nn.Linear(256, 26) 

    def forward(self, x):
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        x = x.view(-1, 64 * 7 * 7)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        return self.fc2(x)

# --- Nepali Model (Devanagari) ---
class RobustDevanagariCNN(nn.Module):
    def __init__(self, num_classes=46):
        super(RobustDevanagariCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 32, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(32)
        self.pool1 = nn.MaxPool2d(2, 2)
        
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(64)
        self.conv4 = nn.Conv2d(64, 64, kernel_size=3, padding=1)
        self.bn4 = nn.BatchNorm2d(64)
        self.pool2 = nn.MaxPool2d(2, 2)
        
        self.conv5 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn5 = nn.BatchNorm2d(128)
        self.pool3 = nn.MaxPool2d(2, 2)
        
        self.dropout = nn.Dropout(0.4)
        self.fc1 = nn.Linear(128 * 4 * 4, 512)
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, x):
        x = F.relu(self.bn1(self.conv1(x)))
        x = self.pool1(F.relu(self.bn2(self.conv2(x))))
        x = F.relu(self.bn3(self.conv3(x)))
        x = self.pool2(F.relu(self.bn4(self.conv4(x))))
        x = self.pool3(F.relu(self.bn5(self.conv5(x))))
        x = x.view(x.size(0), -1)
        x = self.dropout(F.relu(self.fc1(x)))
        return self.fc2(x)

# ==========================================
# 3. LOAD MODELS
# ==========================================

EMNIST_MAPPING = {i: chr(97 + i) for i in range(26)}
DEVANAGARI_CHARS = [
    'ka', 'kha', 'ga', 'gha', 'kna', 'cha', 'chha', 'ja', 'jha', 'yna', 
    'ta', 'tha', 'da', 'dha', 'ana', 'taa', 'thaa', 'daa', 'dhaa', 'na', 
    'pa', 'pha', 'ba', 'bha', 'ma', 'yaw', 'ra', 'la', 'waw', 'sha', 
    'shha', 'sa', 'ha', 'ksh', 'tra', 'gya',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
]
DEVANAGARI_MAPPING = {i: DEVANAGARI_CHARS[i] for i in range(len(DEVANAGARI_CHARS))}

english_model = Net()
nepali_model = RobustDevanagariCNN(num_classes=46)

def load_weights(model, path):
    if os.path.exists(path):
        model.load_state_dict(torch.load(path, map_location=device))
        model.to(device)
        model.eval()
        print(f"✅ Loaded Model: {path}")
        return model
    print(f"⚠️ Warning: Model not found at {path}")
    return None

active_english_model = load_weights(english_model, ENGLISH_MODEL_PATH)
active_nepali_model = load_weights(nepali_model, NEPALI_MODEL_PATH)

# ==========================================
# 4. API REQUEST/RESPONSE MODELS
# ==========================================

class HandwritingSubmission(BaseModel):
    target_letter: str
    image_base64: str
    language: str

class AnalysisResult(BaseModel):
    question_type: str  # 'writing' or 'speaking'
    target: str
    predicted: str
    confidence: float
    is_correct: bool
    risk_weight: int
    feedback: str

class FinalAssessmentRequest(BaseModel):
    results: List[AnalysisResult]

class FinalAssessmentResponse(BaseModel):
    score_percentage: int
    risk_label: str
    risk_color: str
    summary_text: str

# ==========================================
# 5. ENDPOINTS
# ==========================================

@router.get("/curriculum")
async def get_curriculum():
    """Returns the list of Writing and Speaking questions."""
    return CURRICULUM

@router.post("/analyze/writing", response_model=AnalysisResult)
async def analyze_writing(data: HandwritingSubmission):
    """Analyzes handwriting and checks for specific confusion pairs."""
    
    # Select Model & Config
    if data.language == "nepali":
        model = active_nepali_model
        mapping = DEVANAGARI_MAPPING
        img_size = 32
        content_size = 24
    else:
        model = active_english_model
        mapping = EMNIST_MAPPING
        img_size = 28
        content_size = 20

    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded on backend")

    try:
        # --- 1. Image Preprocessing ---
        if "base64," in data.image_base64:
            base64_str = data.image_base64.split("base64,")[1]
        else:
            base64_str = data.image_base64
        
        image_data = base64.b64decode(base64_str)
        img = Image.open(io.BytesIO(image_data))

        # Handle Transparency (Alpha to White)
        if img.mode != 'RGB':
            bg = Image.new("RGB", img.size, (255, 255, 255))
            if 'A' in img.mode:
                bg.paste(img, mask=img.split()[3])
            else:
                bg.paste(img)
            img = bg

        # Convert to Grayscale, Invert, Thicken
        img = img.convert("L")
        img = ImageOps.invert(img)
        img = img.filter(ImageFilter.MaxFilter(5)) 

        # Smart Crop & Center
        bbox = img.getbbox()
        if bbox:
            img_cropped = img.crop(bbox)
            new_img = Image.new("L", (img_size, img_size), 0)
            img_cropped.thumbnail((content_size, content_size), Image.Resampling.LANCZOS)
            w, h = img_cropped.size
            x_pad = (img_size - w) // 2
            y_pad = (img_size - h) // 2
            new_img.paste(img_cropped, (x_pad, y_pad))
            img = new_img
        else:
            img = img.resize((img_size, img_size))

        # --- 2. Model Prediction ---
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.5,), (0.5,))
        ])
        img_tensor = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(img_tensor)
            probs = F.softmax(output, dim=1)
            confidence, predicted_idx = torch.max(probs, 1)
            pred_char = mapping.get(predicted_idx.item(), "?")
            conf_score = confidence.item()

        # --- 3. Dyslexia Scoring Logic (Specific to your pairs) ---
        target = data.target_letter.lower()
        predicted = pred_char.lower()
        is_correct = (target == predicted)
        
        risk_weight = 0
        feedback = "Good match!"

        if data.language == "english":
            # English Logic (u, s, b, p, d)
            reversals = {
                'b': 'd', 'd': 'b', 
                'p': 'q', 'q': 'p', 
                'u': 'n', 'n': 'u', # Rotation
                's': '5' # Visual approximate
            }
            if is_correct:
                feedback = "Correct!"
            elif reversals.get(target) == predicted:
                risk_weight = 100 # Maximum risk for mirror/rotation errors
                feedback = f"Mirror/Rotation Error: Wrote '{predicted}' instead of '{target}'"
            else:
                risk_weight = 20 # General error
                feedback = f"Incorrect. Looks like '{predicted}'"

        else:
            # Nepali Logic (Specific Confusion Pairs: क/फ, ब/व, त/न, द/ध)
            # Note: 'waw' is used for 'wa' in the class mapping usually.
            
            nepali_confusions = {
                'ka': ['pha', 'pa'],   # ka vs pha
                'ba': ['waw', 'wa', 'vaw'], # ba vs wa
                'ta': ['na', 'la'],    # ta vs na (or bha sometimes)
                'da': ['dha', 'gha'],  # da vs dha
                'pha': ['ka'],
                'waw': ['ba'],
                'na': ['ta'],
                'dha': ['da']
            }

            if is_correct:
                feedback = "Correct (Nepali)"
            elif predicted in nepali_confusions.get(target, []):
                risk_weight = 90 # High risk for specific confusion pairs
                feedback = f"Visual Confusion: Wrote '{predicted}' instead of '{target}'"
            else:
                risk_weight = 30 # Standard error
                feedback = f"Incorrect. Looks like '{predicted}'"

        return {
            "question_type": "writing",
            "target": target,
            "predicted": predicted,
            "confidence": conf_score,
            "is_correct": is_correct,
            "risk_weight": risk_weight,
            "feedback": feedback
        }

    except Exception as e:
        print(f"❌ Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="Processing failed")

@router.post("/analyze/speaking", response_model=AnalysisResult)
async def analyze_speaking(
    file: UploadFile = File(...), 
    target_text: str = Form(...),
    language: str = Form(...)
):
    """
    Analyzes audio using Gemini.
    Targets phonological processing:
    - English: "The big black dog dug a deep dark ditch" (Alliteration/Stops)
    - Nepali: "दिनदिनै नदी नजिक..." (Rhythm/Phonemes)
    """
    try:
        if not GOOGLE_API_KEY:
            raise HTTPException(status_code=500, detail="Google API Key missing")

        # 1. Read File
        audio_bytes = await file.read()
        
        # 2. Initialize Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # 3. Prompt for Dyslexia Assessment
        prompt = f"""
        Analyze this audio recording of a child reading the text: "{target_text}".
        Language: {language}.

        Dyslexia Screening Focus:
        1. Transcribe exactly what was said.
        2. Check for:
           - Stuttering on plosive sounds (b, d, p, k, t).
           - Skipping words or substituting words visually similar.
           - Reading fluency/speed (too slow?).
        
        Assign 'risk_weight':
        - 0: Fluent.
        - 20: Minor hesitation.
        - 60: Significant stumbling on similar sounds (e.g., 'dog' vs 'dug').
        - 100: Inability to read or skipping multiple words.
        
        Return STRICT JSON:
        {{
            "transcribed_text": "string",
            "accuracy_score": integer (0-100),
            "risk_weight": integer,
            "feedback": "Short feedback max 10 words"
        }}
        """

        # 4. Generate Content
        response = model.generate_content([
            prompt,
            {
                "mime_type": "audio/mp3", 
                "data": audio_bytes
            }
        ])

        # 5. Clean and parse JSON
        raw_text = response.text
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0]
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0]
            
        analysis = json.loads(raw_text.strip())

        return {
            "question_type": "speaking",
            "target": target_text,
            "predicted": analysis.get("transcribed_text", ""),
            "confidence": analysis.get("accuracy_score", 0) / 100.0,
            "is_correct": analysis.get("risk_weight", 100) < 40,
            "risk_weight": analysis.get("risk_weight", 0),
            "feedback": analysis.get("feedback", "Good effort!")
        }

    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        return {
            "question_type": "speaking",
            "target": target_text,
            "predicted": "Error processing audio",
            "confidence": 0,
            "is_correct": False,
            "risk_weight": 0,
            "feedback": "Analysis failed. Try again."
        }

@router.post("/finish-assessment", response_model=FinalAssessmentResponse)
async def calculate_final_score(data: FinalAssessmentRequest):
    """Calculates final Dyslexia Risk Score based on results."""
    
    if not data.results:
        return {
            "score_percentage": 0, 
            "risk_label": "N/A", 
            "risk_color": "", 
            "summary_text": "No data."
        }

    total_risk = sum(r.risk_weight for r in data.results)
    max_possible_risk = len(data.results) * 100
    
    if max_possible_risk == 0:
        risk_percentage = 0
    else:
        risk_percentage = min(math.ceil((total_risk / max_possible_risk) * 100), 100)

    # Determine Label
    if risk_percentage < 25:
        label = "Low Probability"
        color = "text-green-600"
        summary = "User shows strong phonological awareness and letter recognition."
    elif risk_percentage < 60:
        label = "Moderate Probability"
        color = "text-orange-600"
        summary = "Some signs of confusion with specific visual/auditory pairs detected."
    else:
        label = "High Probability"
        color = "text-red-600"
        summary = "Significant challenges with mirror letters and phonemic sequencing detected."

    return {
        "score_percentage": risk_percentage,
        "risk_label": label,
        "risk_color": color,
        "summary_text": summary
    }

# ==========================================
# 6. MOUNT STATIC AUDIO FOLDER
# ==========================================
# Make sure a folder named 'audio' exists in the root directory
if not os.path.exists("audio"):
    os.makedirs("audio")
    print("⚠️ Created 'audio' directory. Please place your .mp3 files there.")

