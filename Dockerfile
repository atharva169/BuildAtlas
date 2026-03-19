# Use a highly optimized, lightweight Python environment
FROM python:3.11-slim

# Create the working directory for the application
WORKDIR /app/backend

# Copy just the required configuration files first to cache layers
COPY backend/requirements.txt .

# Install pip dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the actual backend source code (app folder, main.py, etc)
COPY backend/ .

# The PaaS (Railway) sets the PORT variable automatically, we expose it for documentation
ENV PORT=8000
EXPOSE $PORT

# Start the uvicorn FastAPI server on the required port
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
