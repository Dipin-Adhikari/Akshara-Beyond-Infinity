import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes import test, stories # assuming you put seed in admin.py

if not os.path.exists("images"):
    os.makedirs("images")

app = FastAPI(title="Akshara Play API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/audio", StaticFiles(directory="audio"), name="audio")
app.mount("/images", StaticFiles(directory="images"), name="images")

app.include_router(test.router)
app.include_router(stories.router)