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
- [Python](https://www.python.org/downloads/) (Version 3.8 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (or use MongoDB Atlas for cloud-based database)
- [Git](https://git-scm.com/downloads)

## Installation & Setup

### Frontend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/<your-github-user>/MotionFrame.git
   cd MotionFrame
   ```

2. Install frontend dependencies:
   ```sh
   cd react-app
   npm install
   ```

3. Start the frontend development server:
   ```sh
   npm run dev
   ```
   The frontend will be available at http://localhost:5173/MotionFrame/

### Backend Setup
1. Navigate to the backend directory:
   ```sh
   cd ../Backend
   ```

2. Install backend dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the Backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. Start the backend server:
   ```sh
   npm start
   ```
   The backend API will be available at http://localhost:3000

### Machine Learning Setup
1. Navigate to the MachineLearning directory:
   ```sh
   cd ../MachineLearning
   ```

2. Create a Python virtual environment:
   ```sh
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```sh
     .\venv\Scripts\activate
     ```
   - macOS/Linux:
     ```sh
     source venv/bin/activate
     ```

4. Install Python dependencies:
   ```sh
   pip install -r requirements.txt
   ```

## Development Workflow
1. Start the backend server first (in the Backend directory)
2. Start the frontend development server (in the react-app directory)
3. The Machine Learning components will be called as needed by the backend

## Troubleshooting
- If you encounter port conflicts, modify the PORT variable in the backend `.env` file
- Ensure MongoDB is running and accessible
- For Python-related issues, ensure your virtual environment is activated
- If you see linting errors during frontend setup, they won't prevent the application from running but should be addressed for code quality

## Project Structure
```
MotionFrame/
├── react-app/          # Frontend React application
├── Backend/            # Node.js backend server
├── MachineLearning/    # Python ML components
├── Storage/            # File storage directory
└── Test/              # Test files and utilities
```

