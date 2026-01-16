import os
import hashlib
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

load_dotenv()

SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")

AUDIO_DIR = "audio"
BASE_URL = "http://localhost:8000/audio"

def generate_and_save_audio(text: str, language: str = "English") -> str:
    """
    Generates speech using Azure. 
    Switches voice based on 'language' argument.
    """
    if not SPEECH_KEY or not SPEECH_REGION:
        print("AZURE_SPEECH_KEY or REGION missing")
        return ""

    # 1. Unique Filename (Hash text + voice to avoid collisions)
    # We include language in hash so English/Nepali versions don't overwrite if text somehow matches
    combo_string = f"{text}_{language}"
    text_hash = hashlib.md5(combo_string.encode()).hexdigest()
    filename = f"story_{text_hash}.wav"
    file_path = os.path.join(AUDIO_DIR, filename)

    # 2. Return Cache
    if os.path.exists(file_path):
        return f"{BASE_URL}/{filename}"

    try:
        speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
        
        # --- VOICE SELECTION LOGIC ---
        if language.lower() == "nepali":
            speech_config.speech_synthesis_voice_name = "ne-NP-HemkalaNeural"
        else:
            # Default to English (Ava is great for kids)
            speech_config.speech_synthesis_voice_name = "en-US-AnaNeural" 
        # -----------------------------

        audio_config = speechsdk.audio.AudioOutputConfig(filename=file_path)
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

        # Speak
        result = synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return f"{BASE_URL}/{filename}"
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = result.cancellation_details
            print(f"Speech Canceled: {cancellation_details.reason}")
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                print(f"Error details: {cancellation_details.error_details}")
            return ""
        else:
            return ""

    except Exception as e:
        print(f"Audio Gen Error: {e}")
        return ""