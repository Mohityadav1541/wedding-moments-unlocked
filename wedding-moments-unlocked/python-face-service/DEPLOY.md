# Deploying Python Face Recognition Service on Render (Free Tier)

## 1. Preparation
Ensure you have the following files in your `python-face-service` folder:
- `main.py`
- `requirements.txt`

## 2. Push to GitHub
1. Commit your new folder to your existing repository.
   ```bash
   git add python-face-service
   git commit -m "Add python face recognition service"
   git push
   ```

## 3. Create Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select your repository `wedding-moments-unlocked`.
4. **Important Settings**:
   - **Root Directory**: `python-face-service` (This tells Render where the app is)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

## 4. Environment Variables
In the Render Dashboard (Environment tab), add:
- `MONGO_URI`: (Your MongoDB Connection String)
- `MATCH_THRESHOLD`: `0.45`

## 5. Deploy
1. Click **Create Web Service**.
2. Wait for the build. It will download the `insightface` models automatically on first run.

## 6. Usage
Once deployed, your URL will be something like `https://python-face-service.onrender.com`.

- **Register Face**: `POST /register` (form-data: `image`, `label`)
- **Match Face**: `POST /match` (form-data: `image`)

## Note on RAM (Requires 2GB+)
- The application uses `buffalo_l` model which is the **High Accuracy** model.
- It requires at least **2GB RAM** (Render Standard Plan) to run reliably.
- Do NOT deploy this on the Free Tier (512MB), it will crash.
