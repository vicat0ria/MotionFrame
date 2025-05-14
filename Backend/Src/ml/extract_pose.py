import cv2
import mediapipe as mp
import numpy as np 
import json 
import sys
import os 

def extract_pose(input_video_path, output_json_path, output_video_path = None):
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(input_video_path)

    if not cap.isOpened():
        print(f"Error: Cannot open video file {input_video_path}")
        return

    #setup Video writer if output_video_path is specified
    writer  = None
    if output_video_path:
        fourcc =cv2.VideoWriter_fourcc(*'mp4v') #codec type
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        writer = cv2.VideoWriter(output_video_path, fourcc,fps,(width,height))

    # Get video dimensions for normalization
    original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_count = 0
    landmarks_data = []

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
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

            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            frame_landmarks = []
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    image,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS
                )

                frame_landmarks = []
                for idx, landmark in enumerate(results.pose_landmarks.landmark):
                    # MediaPipe already provides normalized coordinates (0-1)
                    # We'll keep them as is for better cross-resolution compatibility
                    frame_landmarks.append({
                        "id": idx,
                        "x": landmark.x,
                        "y": landmark.y,
                        "z": landmark.z,
                        "visibility": landmark.visibility
                    })

            else:
                frame_landmarks = []
            landmarks_data.append(frame_landmarks)

            if writer:
                writer.write(image)

    cap.release()
    if writer:
        writer.release()

    # Add metadata about original video dimensions to help with rendering
    output_data = {
        "metadata": {
            "original_width": original_width,
            "original_height": original_height,
            "frame_count": frame_count,
            "fps": cap.get(cv2.CAP_PROP_FPS) or 30
        },
        "landmarks": landmarks_data
    }

    with open(output_json_path, "w") as f:
        json.dump(output_data, f, indent=4)

    print(f" Pose extraction complete. {frame_count} frames processed.")
    print(f" JSON saved to: {output_json_path}")

# Command-line usage
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python extract_pose.py input_video.mp4 output_pose.json")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    extract_pose(input_path, output_path)
