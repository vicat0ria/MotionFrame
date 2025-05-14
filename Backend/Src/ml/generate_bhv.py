import json
import sys

JOINT_HIERARCHY = [
    "Hips",
    "Spine",
    "Neck",
    "Head",
    "LeftUpperArm",
    "LeftLowerArm",
    "RightUpperArm",
    "RightLowerArm",
    "LeftUpperLeg",
    "RightUpperLeg"
]

#BVH hierarchy block
def write_hierarchy():
    return f"""HIERARCHY
ROOT Hips
{{
  OFFSET 0.00 0.00 0.00
  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
  JOINT Spine
  {{
    OFFSET 0 10 0
    CHANNELS 3 Zrotation Xrotation Yrotation
    JOINT Neck
    {{
      OFFSET 0 10 0
      CHANNELS 3 Zrotation Xrotation Yrotation
      JOINT Head
      {{
        OFFSET 0 10 0
        CHANNELS 3 Zrotation Xrotation Yrotation
      }}
    }}
    JOINT LeftUpperArm
    {{
      OFFSET -10 10 0
      CHANNELS 3 Zrotation Xrotation Yrotation
      JOINT LeftLowerArm
      {{
        OFFSET -10 0 0
        CHANNELS 3 Zrotation Xrotation Yrotation
      }}
    }}
    JOINT RightUpperArm
    {{
      OFFSET 10 10 0
      CHANNELS 3 Zrotation Xrotation Yrotation
      JOINT RightLowerArm
      {{
        OFFSET 10 0 0
        CHANNELS 3 Zrotation Xrotation Yrotation
      }}
    }}
    JOINT LeftUpperLeg
    {{
      OFFSET -5 -10 0
      CHANNELS 3 Zrotation Xrotation Yrotation
    }}
    JOINT RightUpperLeg
    {{
      OFFSET 5 -10 0
      CHANNELS 3 Zrotation Xrotation Yrotation
    }}
  }}
}}
"""
# Motion data block
def write_motion(landmark_data, fps=30):
    frame_time = 1 / fps
    motion = f"MOTION\nFrames: {len(landmark_data)}\nFrame Time: {frame_time:.6f}\n"

    for frame in landmark_data:
        # We'll use only landmark 0 (hip) position to fill translation values
        try:
            hip = frame[0]
            x = hip['x'] * 100
            y = hip['y'] * 100
            z = hip['z'] * 100
        except (IndexError, KeyError):
            x = y = z = 0

        # Dummy rotations (0s)
        motion += f"{x:.2f} {y:.2f} {z:.2f} " + "0 0 0 " * (len(JOINT_HIERARCHY) - 1) + "\n"
    return motion

# Load pose data JSON and convert to BVH
def convert_to_bvh(json_path, output_path):
    with open(json_path, "r") as f:
        pose_data = json.load(f)
    # If the JSON contains metadata and landmarks, extract the landmark list
    if isinstance(pose_data, dict) and "landmarks" in pose_data:
        landmark_data_list = pose_data["landmarks"]
    else:
        landmark_data_list = pose_data

    hierarchy = write_hierarchy()
    motion = write_motion(landmark_data_list)
    
    with open(output_path, "w") as f:
        f.write(hierarchy)
        f.write(motion)

    print(f"BVH file saved to {output_path}")

# CLI usage
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_bvh.py input_pose.json output_file.bvh")
        sys.exit(1)

    json_input = sys.argv[1]
    bvh_output = sys.argv[2]
    convert_to_bvh(json_input, bvh_output)