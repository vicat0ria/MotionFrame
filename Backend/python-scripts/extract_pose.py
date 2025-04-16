import cv2
import mediapipe as mp
import numpy as np 
import json 
import sys
import os 

def extract_pose(input_video_path, output_json_path):
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(input_video_path)

    if not cap.isOpened():
        print(f"Error: Cannot open video file {input_video_path}")
        return
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_count = 0
    landmarks_data = []

    with mp_pose.Pose(min_detection_confidence=0.2, min_tracking_confidence=0.2) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Convert to RGB
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False

            # Run pose detection
            results = pose.process(image)

            frame_landmarks = []
            if results.pose_landmarks:
                for idx, landmark in enumerate(results.pose_landmarks.landmark):
                    frame_landmarks.append({
                        "id": idx,
                        "x": landmark.x,
                        "y": landmark.y,
                        "z": landmark.z,
                        "visibility": landmark.visibility
                    })

            landmarks_data.append(frame_landmarks)

    cap.release()

    with open(output_json_path, "w") as f:
        json.dump(landmarks_data, f, indent=4)

    print(f"✅ Pose extraction complete. {frame_count} frames processed.")
    print(f"📝 JSON saved to: {output_json_path}")

# Command-line usage
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python extract_pose.py input_video.mp4 output_pose.json")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    extract_pose(input_path, output_path)
