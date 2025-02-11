# MotionFrame: Motion Capture Processing for Animation

## Group Members
- Bryan Abrego
- Daniel Betancourt
- Victoria Miteva

## Introduction
MotionFrame is a web-based system designed to extract and refine human motion data from videos, making it ready for animation and 3D applications. Using **MediaPipe Pose**, the platform efficiently detects skeletal movements in real-time, ensuring smooth and accurate motion capture without requiring high-end hardware or GPUs.

## Objectives and Scope
MotionFrame aims to:
- **Enable Easy Video-Based Motion Capture**: Users can upload videos of human movement and extract skeletal motion data without specialized hardware.
- **Ensure Real-Time Pose Estimation and Motion Visualization**: MediaPipe Pose detects and tracks skeletal movement, displaying extracted motion data in a 2D/3D viewer.
- **Offer Motion Refinement**: Implement Kalman filters and other noise reduction techniques to smooth movement, handle occlusion, and improve animation quality.
- **Provide an Intuitive GUI**: A user-friendly interface allows users to upload videos, view extracted motion data, apply customizations, and export in their preferred format.

## Features and Technology
### Core Features:
- **Video Upload & Processing**: Users upload videos, and the system extracts keyframes for motion analysis.
- **Pose Estimation & Skeleton Extraction**: Uses **MediaPipe Pose** to detect and track skeletal movement.
- **Real-time Motion Visualization**: Displays extracted skeletal motion in a 2D/3D environment.
- **Data Filtering & Refinement**: Implements Kalman filters and frame interpolation for smoother animations.
- **Animation Export**: Supports formats like **BVH, FBX, JSON** for use in **Blender, Unity, and other 3D applications**.

### Tech Stack:
| Component | Technology |
|-----------|------------|
| Frontend | HTML, CSS, JavaScript/TypeScript (**React.js + Three.js/WebGL**) |
| Backend | Node.js + Express.js, passport.js, socket.io |
| Database & Storage | MongoDB Atlas (GridFS) |
| Machine Learning | PyTorch/TensorFlow, MediaPipe Pose |
| Video Processing | FFmpeg |
| Deployment | Docker, Render, Railway, Google Cloud Platform, AWS |

## References
### Motion Capture Research & Techniques
- **"DeepLabCut: Markerless Pose Estimation of User-Defined Body Parts with Deep Learning" (Current Biology)** – Discusses deep learning-based pose estimation for motion capture without markers.
- **"Motion Capture: Overview and Technical Challenges" (Stanford AI)** – Provides an overview of motion capture technology, including challenges and future directions.
- **Carnegie Mellon University Motion Capture Database (CMU MoCap)** – A comprehensive dataset of human motion capture recordings, useful for research and animation.

### Open-source Motion Capture Platforms
- **[FreeMoCap Project](https://freemocap.org/)** – An open-source initiative for markerless motion capture using consumer-grade cameras.
- **[FreeMoCap GitHub Repository](https://github.com/freemocap/freemocap)** – Source code and development resources for the FreeMoCap system.

### GUI Inspiration & Design Philosophy
- **[Rokoko Studio](https://www.rokoko.com/)** – A professional motion capture tool with an intuitive UI for animation and real-time tracking.
- **[Clipchamp](https://www.clipchamp.com/)** – A simple, user-friendly video editing platform that serves as a UI reference.

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/motionframe.git
   cd motionframe
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend:
   ```sh
   npm run server
   ```
4. Start the frontend:
   ```sh
   npm run client
   ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See `LICENSE` for details.
