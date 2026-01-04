# How to Deploy Your AI Backend to Hugging Face

## 1. Create a Hugging Face Space
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **"Create new Space"**.
2. **Name**: `wedding-moments-ai` (or similar).
3. **License**: Apache 2.0 (optional).
4. **SDK**: Select **Docker**.
5. **Template**: Choose **Blank** (since we have our own Dockerfile).
6. Click **Create Space**.

## 2. Upload Files
You have a folder named `huggingface_space` in your project. You need to upload the files inside it to your new Space.

**Option A: Upload via Browser**
1. In your Space, go to the **Files** tab.
2. Click **Add file** -> **Upload files**.
3. Drag and drop the following files from your `huggingface_space` folder:
   - `Dockerfile`
   - `app.py`
   - `requirements.txt`
4. Click **Commit changes** to `main`.

**Option B: using Git (Terminal)**
```bash
cd huggingface_space
git init
git add .
git commit -m "Initial commit"
git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
git push --force origin master
```

## 3. Get the URL
1. Once the Space is "Running" (green badge), look for the request URL.
2. It usually looks like: `https://your-username-space-name.hf.space`
3. Click on the options (three dots) -> **Embed this space** -> Copy the **Direct URL**.

## 4. Connect Your Backend
1. Open your `backend/.env` file.
2. Find `HUGGING_FACE_API_URL`.
3. Paste the URL you copied.
   ```
   HUGGING_FACE_API_URL=https://your-username-space-name.hf.space
   ```
4. Restart your backend server (`npm run dev` in backend folder).

## Troubleshooting
- If the build fails, check the "Logs" tab in Hugging Face.
- If it says "Building", be patient. It takes 2-3 minutes to install `dlib`.
- To test if it works, visit the URL in your browser. You should see `{"status":"online"..."}`.
