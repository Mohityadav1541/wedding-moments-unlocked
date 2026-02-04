import os
import cv2
import numpy as np
import io
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from pymongo import MongoClient
import insightface
from insightface.app import FaceAnalysis
from dotenv import load_dotenv
from PIL import Image

# Load environment variables
load_dotenv()

# --- Configuration ---
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "wedding_moments_db" # Adjust if your DB name differs
COLLECTION_NAME = "face_embeddings"
MATCH_THRESHOLD = float(os.getenv("MATCH_THRESHOLD", 0.45)) # Default to 0.45

# --- App Setup ---
app = FastAPI(title="Lightweight Face Recognition API")

# --- Global Variables ---
model = None
mongo_client = None
db = None
embeddings_collection = None

# --- Lifecycle Events ---
@app.on_event("startup")
async def startup_event():
    global mongo_client, db, embeddings_collection
    
    print("⏳ Connecting to MongoDB...")
    if not MONGO_URI:
        print("⚠️  WARNING: MONGO_URI not found in env. DB features will fail.")
    else:
        mongo_client = MongoClient(MONGO_URI)
        db = mongo_client[DB_NAME]
        embeddings_collection = db[COLLECTION_NAME]
        print("✅ Connected to MongoDB!")

@app.on_event("shutdown")
def shutdown_event():
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed.")

# --- Helper Functions ---
def get_model():
    """Lazy load the model to avoid OOM on startup."""
    global model
    if model is None:
        print("⏳ Lazy Loading InsightFace model (buffalo_s)...")
        # 'buffalo_s' is lightweight: ~10MB download, fast CPU inference
        model = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
        model.prepare(ctx_id=-1, det_size=(640, 640))
        print("✅ Model loaded successfully!")
    return model

def process_image(file_bytes):
    """Convert uploaded file bytes to OpenCV format (BGR)."""
    try:
        image = Image.open(io.BytesIO(file_bytes)).convert('RGB')
        image = np.array(image)
        # Convert RGB to BGR (OpenCV standard)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

def compute_cosine_similarity(embed1, embed2):
    """Compute cosine similarity between two 1D embedding vectors."""
    # Ensure vectors are normalized (InsightFace output is usually normalized, but good to be safe)
    # Cosine Similarity = (A . B) / (||A|| * ||B||)
    # InsightFace embeddings are typically unit length, so dot product is enough.
    # We'll do full calculation just in case.
    norm1 = np.linalg.norm(embed1)
    norm2 = np.linalg.norm(embed2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return np.dot(embed1, embed2) / (norm1 * norm2)

# --- Imports ---
import requests
from pydantic import BaseModel

# --- Request Models ---
class AnalysisRequest(BaseModel):
    url: str

@app.post("/analyze-url")
async def analyze_url_endpoint(request: AnalysisRequest):
    """
    Downloads an image from a URL and returns face descriptors.
    Used by the Backend to process Cloudinary images.
    """
    url = request.url
    if not url:
        raise HTTPException(status_code=400, detail="No URL provided")

    try:
        # Download image
        # Timeout is important to prevent hanging
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        
        file_bytes = resp.content
        img_cv = process_image(file_bytes)

        # Inference (Lazy Load)
        face_model = get_model()
        faces = face_model.get(img_cv)

        if len(faces) == 0:
            return {"descriptors": []}
        
        # Return all found faces (descriptors)
        # Convert numpy floats to native python floats for JSON serialization
        descriptors = [face.embedding.tolist() for face in faces]
        
        return {
            "descriptors": descriptors,
            "count": len(faces)
        }

    except requests.exceptions.RequestException as e:
        print(f"Failed to download image: {url} - {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")
    except Exception as e:
        print(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "running", "service": "Face Recognition API"}

@app.post("/register")
async def register_face(
    image: UploadFile = File(...),
    label: str = Form(...), # e.g., "Guest Name" or "User ID"
    metadata: str = Form(None) # Optional JSON string
):
    """
    Detects a face, generates an embedding, and stores it in MongoDB.
    """
    if not embeddings_collection:
        raise HTTPException(status_code=503, detail="Database not configured.")

    contents = await image.read()
    img_cv = process_image(contents)

    # Inference (Lazy Load)
    face_model = get_model()
    faces = face_model.get(img_cv)

    if len(faces) == 0:
        return JSONResponse(status_code=400, content={"error": "No face detected"})
    
    if len(faces) > 1:
        # For registration, strict 1-face rule is usually better
        # Alternatively, take the largest face (faces are usually sorted by size/det_score)
        # Let's take the largest for robustness, but warn.
        print(f"Warning: {len(faces)} faces detected. Using the most prominent one.")
    
    # InsightFace sort order is usually detection score or size. 
    # Let's pick the one with highest detection score just to be sure.
    target_face = max(faces, key=lambda x: x.det_score)
    
    embedding = target_face.embedding.tolist() # Convert numpy array to list for JSON/Mongo

    # Store in DB
    doc = {
        "label": label,
        "embedding": embedding,
        "created_at": np.datetime64('now').astype(str),
        "metadata": metadata
    }
    
    result = embeddings_collection.insert_one(doc)
    
    return {
        "status": "success",
        "face_id": str(result.inserted_id),
        "det_score": float(target_face.det_score)
    }

@app.post("/match")
async def match_face(
    image: UploadFile = File(...),
    limit: int = Form(5)
):
    """
    Detects faces in input image and finds matches in the database.
    """
    if not embeddings_collection:
        raise HTTPException(status_code=503, detail="Database not configured.")

    contents = await image.read()
    img_cv = process_image(contents)

    # Inference (Lazy Load)
    face_model = get_model()
    faces = face_model.get(img_cv)

    if len(faces) == 0:
        return JSONResponse(status_code=400, content={"error": "No face detected in input image"})

    # For matching, we might want to match ALL faces found in the image?
    # Or just the main one? The requirement said "Input: face image", implying single query.
    # Let's assume we match the prominent face.
    target_face = max(faces, key=lambda x: x.det_score)
    query_embedding = target_face.embedding

    # --- Fetch & Compare (Memory Optimized) ---
    # With 15k faces, fetching all embeddings (15k * 512 floats) is reasonably fast (few MBs).
    # Ideally, we'd enable a vector index in Atlas, but for "Basic Python" req, 
    # we'll do linear scan in numpy which is very fast for 15k.
    
    # 1. Fetch all embeddings (or cache them - simpler to fetch for statelessness on Render)
    # Projection to only fetch needed fields
    cursor = embeddings_collection.find({}, {"embedding": 1, "label": 1, "_id": 1})
    
    db_faces = list(cursor)
    
    if not db_faces:
        return {"matches": []}

    # 2. Convert to numpy matrix
    db_embeddings = [f["embedding"] for f in db_faces]
    db_embeddings_np = np.array(db_embeddings, dtype=np.float32)
    
    # 3. Compute Similarities (Vectorized)
    # Query: (512,)  DB: (N, 512)
    # Dot product: (N,)
    
    # Normalize query
    query_norm = np.linalg.norm(query_embedding)
    query_unit = query_embedding / query_norm
    
    # Normalize DB (assuming they might not be perfect, though usually are)
    # Axis=1 means row-wise
    db_norms = np.linalg.norm(db_embeddings_np, axis=1)
    # Avoid div by zero
    db_norms[db_norms == 0] = 1e-9
    db_unit = db_embeddings_np / db_norms[:, np.newaxis]
    
    # Cosine Sim = dot(A_unit, B_unit)
    similarities = np.dot(db_unit, query_unit)
    
    # 4. Filter & Sort
    # Get top K indices
    # argsort gives ascending, so we reverse
    sorted_indices = np.argsort(similarities)[::-1]
    
    matches = []
    for idx in sorted_indices[:limit]:
        score = float(similarities[idx])
        if score < MATCH_THRESHOLD:
            continue
            
        matches.append({
            "face_id": str(db_faces[idx]["_id"]),
            "label": db_faces[idx].get("label", "Unknown"),
            "similarity": score
        })
    
    return {
        "matches": matches,
        "input_face_det_score": float(target_face.det_score)
    }
