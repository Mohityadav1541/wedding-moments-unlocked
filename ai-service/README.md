# AI Service Deployment Guide

This directory contains the Python-based Face Recognition service using **FastAPI** and **InsightFace**.

## How to Deploy on Hugging Face (Free)

1.  **Create a Hugging Face Account**: [https://huggingface.co/join](https://huggingface.co/join)
2.  **Create a New Space**:
    *   Go to [https://huggingface.co/new-space](https://huggingface.co/new-space)
    *   **Space Name**: `wedding-moments-ai` (or similar)
    *   **License**: MIT (optional)
    *   **SDK**: Select **Docker** (Crucial!)
    *   **Template**: Blank
    *   **Visibility**: Public (easiest) or Private (requires token)
    *   Click **Create Space**.

3.  **Upload Files**:
    *   Once created, you will see a page with "App", "Files", "Settings".
    *   Go to the **Files** tab.
    *   Click **Add file** -> **Upload files**.
    *   Drag and drop the following files from this `ai-service` folder:
        *   `app.py`
        *   `requirements.txt`
        *   `Dockerfile`
    *   Click **Commit changes to main**.

4.  **Wait for Build**:
    *   The "App" tab will show "Building". It make take 5-10 minutes initially to download dependencies and models.
    *   Once done, it will show "Running".

5.  **Get the URL**:
    *   Your API URL will be: `https://<your-username>-<space-name>.hf.space`
    *   **Important**: Copy this URL. You will give it to me so I can connect your backend!
    *   Example: `https://mohit1541-wedding-moments-ai.hf.space`

## Local Testing (Optional)
```bash
pip install -r requirements.txt
uvicorn app:app --reload
```
