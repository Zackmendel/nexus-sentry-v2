import os
import json
from google.cloud import storage

class GCSClient:
    def __init__(self):
        # We use a unique bucket name based on the project number
        self.bucket_name = os.getenv("GCS_BUCKET_NAME", "x-layer-metadata-349808161165")
        self.storage_client = storage.Client()

    def upload_json(self, data, filename):
        """Uploads a dictionary as a JSON file to GCS and makes it public."""
        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            
            # Create bucket if it doesn't exist
            if not bucket.exists():
                bucket = self.storage_client.create_bucket(self.bucket_name, location="us-central1")
                print(f"Created bucket {self.bucket_name}")

            blob = bucket.blob(filename)
            blob.cache_control = 'no-cache, no-store, must-revalidate'
            blob.upload_from_string(
                data=json.dumps(data, separators=(',', ':')), # Compact JSON
                content_type='application/json'
            )
            
            # Already handled by bucket-level IAM (allUsers as Object Viewer)
            return f"https://storage.googleapis.com/{self.bucket_name}/{filename}"
            
        except Exception as e:
            print(f"GCS Upload Error: {e}")
            return None
