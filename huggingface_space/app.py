from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import face_recognition
import requests
import numpy as np
from PIL import Image
from io import BytesIO

app = FastAPI()

class ImageUrl(BaseModel):
    url: str

def get_image_from_url(url: str):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert('RGB')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image from URL: {str(e)}")

def get_image_from_upload(file: UploadFile):
    try:
        return Image.open(file.file).convert('RGB')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

def get_descriptors(image):
    # Convert PIL image to numpy array
    image_np = np.array(image)
    
    # Detect face locations (using HOG model which is faster)
    face_locations = face_recognition.face_locations(image_np)
    
    if not face_locations:
        return []

    # Compute 128-d face encodings
    face_encodings = face_recognition.face_encodings(image_np, face_locations)
    
    # Convert numpy arrays to lists for JSON serialization
    return [encoding.tolist() for encoding in face_encodings]

@app.get("/")
def read_root():
    return {"status": "online", "message": "Face Recognition API is running"}

@app.post("/analyze-url")
def analyze_url(data: ImageUrl):
    image = get_image_from_url(data.url)
    descriptors = get_descriptors(image)
    return {"descriptors": descriptors}

@app.post("/analyze-file")
def analyze_file(file: UploadFile = File(...)):
    image = get_image_from_upload(file)
    descriptors = get_descriptors(image)
    return {"descriptors": descriptors}
