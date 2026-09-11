import gradio as gr
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import cv2
import numpy as np
import requests
from PIL import Image, ImageOps
from io import BytesIO
import insightface
from insightface.app import FaceAnalysis

app = FastAPI()

# Initialize InsightFace model
face_app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=-1, det_size=(640, 640))

class ImageUrl(BaseModel):
    url: str

def get_cv2_image_from_url(url: str):
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        img = ImageOps.exif_transpose(img)
        img_rgb = np.array(img.convert('RGB'))
        return cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image: {str(e)}")

def get_descriptors_insightface(cv2_img):
    faces = face_app.get(cv2_img)
    if not faces:
        return []
    return [face.embedding.tolist() for face in faces]

@app.post("/analyze-url")
def analyze_url(data: ImageUrl):
    cv2_img = get_cv2_image_from_url(data.url)
    descriptors = get_descriptors_insightface(cv2_img)
    return {"descriptors": descriptors}

def analyze_url_gradio(url: str):
    try:
        cv2_img = get_cv2_image_from_url(url)
        descriptors = get_descriptors_insightface(cv2_img)
        return {"descriptors": descriptors}
    except Exception as e:
        return {"error": str(e)}

demo = gr.Interface(
    fn=analyze_url_gradio,
    inputs=gr.Textbox(label="Image URL"),
    outputs=gr.JSON(label="Face Descriptors"),
    title="Wedding Moments AI Face Recognition"
)

# Mount FastAPI app and launch demo
app = gr.mount_gradio_app(app, demo, path="/")
