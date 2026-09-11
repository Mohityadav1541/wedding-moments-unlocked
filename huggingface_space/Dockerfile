FROM python:3.10-slim

WORKDIR /app

# Install GCC and OpenCV dependencies
RUN apt-get update && apt-get install -y cmake build-essential libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
