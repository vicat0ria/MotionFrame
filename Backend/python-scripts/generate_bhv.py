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
