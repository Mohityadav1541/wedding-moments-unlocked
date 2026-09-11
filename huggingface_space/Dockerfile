FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y cmake build-essential libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Set up user 1000 (Required by Hugging Face)
RUN useradd -m -u 1000 user

USER user
ENV PATH="/home/user/.local/bin:$PATH"
WORKDIR /home/user/app

COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user:user . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
