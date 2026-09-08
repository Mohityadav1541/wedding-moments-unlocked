FROM continuumio/miniconda3

WORKDIR /app

# 1. Install dlib from conda-forge (Binary = FAST, No Compilation)
RUN conda install -y -c conda-forge dlib

# 2. Install GCC and others just in case libraries need glue
RUN apt-get update && apt-get install -y cmake build-essential && rm -rf /var/lib/apt/lists/*

# 3. Install other Python dependencies
COPY requirements.txt .
# We don't include dlib in requirements.txt because conda installed it.
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
