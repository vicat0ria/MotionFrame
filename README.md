# MotionFrame: Motion Capture Processing for Animation

## Group Members (Group 8)
- Bryan Abrego - Backend (Database)
- Daniel Betancourt - Machine Learning
- Victoria Miteva - Frontend

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

### Tech Stack (subject to change): 
| Component | Technology |
|-----------|------------|
| Frontend | React.js, TypeScript, HTML, CSS |
| Backend | Node.js + Express.js |
| Database & Storage | MongoDB Atlas (GridFS) |
| Machine Learning | MediaPipe Pose, Python (Converted to JS), Google Colab |
| Video Processing | TBD |
| Deployment | TBD |

## References
### Motion Capture Research & Techniques
- **[DeepLabCut: Markerless Pose Estimation of User-Defined Body Parts with Deep Learning](https://www.cell.com/current-biology/fulltext/S0960-9822(18)30309-9?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS0960982218303099%3Fshowall%3Dtrue)** – Discusses deep learning-based pose estimation for motion capture without markers.
- **[Motion Capture: Overview and Technical Challenges](https://ai.stanford.edu/~latombe/cs99k/2000/capture.pdf)** – Provides an overview of motion capture technology, including challenges and future directions.
- **[Carnegie Mellon University Motion Capture Database](http://mocap.cs.cmu.edu/)** – A comprehensive dataset of human motion capture recordings, useful for research and animation.

### Open-source Motion Capture Platforms
- **[FreeMoCap Project](https://freemocap.org/)** – An open-source initiative for markerless motion capture using consumer-grade cameras.
- **[FreeMoCap GitHub Repository](https://github.com/freemocap/freemocap)** – Source code and development resources for the FreeMoCap system.

### GUI Inspiration & Design Philosophy
- **[Rokoko Studio](https://www.rokoko.com/)** – A professional motion capture tool with an intuitive UI for animation and real-time tracking.
- **[Clipchamp](https://www.clipchamp.com/)** – A simple, user-friendly video editing platform that serves as a UI reference.

## Prerequisites

Ensure you have the following installed:  
- [Node.js](https://nodejs.org/) (Recommended: LTS version)  

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/<your-github-user>/MotionFrame.git
   cd MotionFrame
   ```
2. Install dependencies:
   ```
   cd react-app
   npm install
   ```
2. Run the Development Server:
   ```
   npm run dev
   ```
   After running the command, you should see output similar to this:
   ```
   VITE vX.X.X ready in Xms
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.X.X:5173/
   ```
   Open http://localhost:5173/ in your browser to view the app.

