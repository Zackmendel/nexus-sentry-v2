# Use official Python image
FROM python:3.12-slim

# Set working directory to app
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the backend code
COPY . .

# Expose the port (Cloud Run uses 8080 by default)
ENV PORT 8080
EXPOSE 8080

# Command to run the application
CMD ["python", "main.py"]
