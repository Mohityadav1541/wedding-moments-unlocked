import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
from PIL import Image

app = FastAPI(title="Face Recognition API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize InsightFace
# buffalo_s is a lightweight model (~100MB) suitable for CPU
print("Loading InsightFace model (buffalo_s)...")
model = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
model.prepare(ctx_id=0, det_size=(640, 640))
print("Model loaded successfully!")

class FaceResponse(BaseModel):
    has_face: bool
    face_count: int
    embedding: list[float] | None = None
    bbox: list[int] | None = None

@app.get("/")
def home():
    return {"status": "running", "model": "insightface-buffalo_s"}

@app.post("/analyze", response_model=list[FaceResponse])
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image data")

        # Perform inference
        faces = model.get(img)
        
        results = []
        if len(faces) == 0:
            return []

        # Find the largest face (assuming looking for primary subject)
        # Or return all faces. For search, usually we want all or the main one.
        # Let's return details for all detected faces.
        
        for face in faces:
            # InsightFace embedding is a 512-d float array (usually) for buffalo_s
            embedding = face.embedding.tolist()
            bbox = face.bbox.astype(int).tolist()
            
            results.append({
                "has_face": True,
                "face_count": len(faces),
                "embedding": embedding,
                "bbox": bbox
            })

        return results

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare")
async def compare_faces(embedding1: list[float], embedding2: list[float]):
    # Compute Cosine Similarity
    # InsightFace embeddings are normalized, so dot product is cosine similarity
    vec1 = np.array(embedding1)
    vec2 = np.array(embedding2)
    
    sim = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    
    # Threshold usually around 0.5 for buffalo_s, but can verify
    match = bool(sim > 0.5)
    
    return {
        "similarity": float(sim),
        "is_match": match
    }
