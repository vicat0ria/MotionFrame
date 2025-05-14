from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import os
import tempfile
import json
import boto3
from .extract_pose import extract_pose

app = FastAPI(
    title="Pose Extraction API",
    description="Upload a video or specify an S3 key to extract human pose landmarks.",
)

@app.post("/extract-pose")
async def extract_pose_endpoint(
    file: UploadFile = File(None),
    s3_key: str = Form(None)
):
    """
    Extract pose landmarks from a video.
    Provide either a file upload (multipart/form-data) or an S3 key (form field `s3_key`).
    """
    if file is None and not s3_key:
        raise HTTPException(status_code=400, detail="Provide a video file or an S3 key.")

    # Create temp video file
    suffix = os.path.splitext(file.filename if file else s3_key)[1] or ".mp4"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        video_path = tmp.name
    json_path = None
    try:
        # Handle upload or S3 download
        if file:
            contents = await file.read()
            with open(video_path, "wb") as f:
                f.write(contents)
        else:
            bucket = os.getenv("AWS_BUCKET_NAME")
            if not bucket:
                raise HTTPException(status_code=500, detail="AWS_BUCKET_NAME not configured")
            s3 = boto3.client("s3")
            try:
                s3.download_file(bucket, s3_key, video_path)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"S3 download failed: {e}")

        # Run pose extraction
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmpjson:
            json_path = tmpjson.name
        extract_pose(video_path, json_path)

        # Read and return landmarks with metadata
        with open(json_path, "r") as f:
            data = json.load(f)
        
        # Return the complete data structure with metadata
        return data
    finally:
        # Cleanup temp files
        for path in (video_path, json_path):
            try:
                if path and os.path.exists(path):
                    os.remove(path)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("ml.extract_pose_api:app", host="0.0.0.0", port=port, reload=True) 