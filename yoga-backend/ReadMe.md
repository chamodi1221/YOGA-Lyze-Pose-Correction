# Yoga Virtual Coach Backend

## Overview
This application is a real-time **Yoga Virtual Coach System**. It takes video streams from a user's webcam, detects their body pose in real-time using a deep learning model, classifies the specific yoga pose they are attempting, and provides live coaching feedback (e.g., "Bend your left knee 10 degrees more") based on predefined anatomical reference angles.

## Technologies Used

The system is built as a highly performant and concurrent Python backend leveraging the following technologies:

- **FastAPI**: The core web framework. It provides both RESTful endpoints for single image classification and WebSocket endpoints for low-latency, real-time video frame streaming. FastAPI’s asynchronous nature allows it to handle multiple active webcam streams efficiently.
- **TensorFlow & Keras**: The deep learning framework powering the intelligence of the app.
  - **MoveNet (Thunder)**: A lightweight, ultra-fast pre-trained Pose Estimation model from TensorFlow Hub. MoveNet takes an image and outputs 17 2D keypoints (x, y, and confidence score) representing body joints (nose, elbows, knees, etc.).
  - **Custom Keras Classifier Model**: A lightweight, custom-trained Multi-Layer Perceptron (MLP) neural network. It takes the normalized 17 keypoints from MoveNet and classifies them into specific yoga pose categories (e.g., `warrior_one`, `tree_pose`).
- **OpenCV**: Used for image processing, specifically for decoding the raw byte streams coming from the WebSocket and converting them into RGB NumPy arrays suitable for TensorFlow.
- **Pandas & NumPy**: For efficient data manipulation, array operations, processing of landmarks, and mathematical computations to calculate joint angles.
- **SQLAlchemy**: The Object Relational Mapper (ORM) used for handling the application's database (for user authentication and data management, if needed).

## Architecture & How They Interact

The architecture is divided into two primary phases: **1. The Offline Training Pipeline** and **2. The Real-time Inference Pipeline**.

### 1. Offline Training Pipeline (Data Preparation)

Before the system can classify poses, it must be trained on a dataset of images categorized by yoga pose.

1.  **Image Pre-processing (`scripts/preprocess.py`)**:
    -   Images are organized into folders by pose class (e.g., `train/warrior_one/`).
    -   The script uses **MoveNet** to detect the 17 body keypoints for every image.
    -   It filters out bad images (where the body isn't fully visible) and flattens the keypoint coordinates into numerical features.
    -   These features are saved to a CSV file alongside their pose labels (`train_data.csv`).
2.  **Model Training (`scripts/train.py`)**:
    -   The script loads the CSV data using **Pandas**.
    -   It normalizes the keypoints (centers the pose around the hips and scales it to a standard size regardless of how close the person is to the camera).
    -   Using **Keras**, it trains a lightweight Neural Network (MLP) mapping the normalized keypoint embeddings to specific yoga pose labels.
    -   The resulting trained model is exported as `pose_classifier.keras` alongside a `class_names.json`.

### 2. Real-time Inference Pipeline (Live Application)

When the server starts, it lazily loads the heavy MoveNet and Keras models to preserve memory, keeping them as singletons to handle high throughput during streams.

The pipeline for a live user looks like this:

1.  **Client Connection (`app/routers/pose.py`)**: The frontend client connects to the **FastAPI** backend via a **WebSocket**. It sets up a loop capturing webcam frames (using `<canvas>`) and sending them as raw JPEG bytes at ~15-30 frames per second.
2.  **Image Decoding (`pose_service.py`)**: The backend receives the JPEG bytes. It uses **OpenCV** to decode those bytes into a NumPy RGB array.
3.  **Keypoint Detection (`pose_service.py`)**: The NumPy array is fed into the **MoveNet TFLite** model. MoveNet outputs the current spatial coordinates of the 17 body joints.
4.  **Pose Classification (`classifier_service.py`)**:
    -   The detected keypoints are processed using the exact same normalization logic used during training.
    -   The normalized embedding is passed into the **Custom Keras Model**, which returns the predicted yoga pose class (e.g., "warrior_one") and a confidence score.
5.  **Angle Calculation & Feedback (`angle_service.py`)**:
    -   Using fundamental trigonometry (dot products of vectors), the system calculates true anatomical angles between key joints (e.g., the angle at the elbow formed by the shoulder and wrist).
    -   It compares these live angles against an "ideal" reference configuration stored in `pose_references.json` for the currently detected pose.
    -   If an angle deviates too much, the system generates actionable coaching feedback (e.g., "Adjust your left knee by 20° more").
6.  **Response**: The backend packages the detected keypoints, the classified pose, and the actionable feedback into a JSON message and sends it back over the WebSocket to the frontend. The frontend uses this data to draw a skeleton overlay on the user's video feed and display the live coaching instructions.

## Full Process From Start to Finish

### Step 1: Prepare Training Data
Create a directory structure within `datasets/images/` organizing standard images of humans doing specific poses into `train/` and `test/` subfolders.
```
datasets/images/
  train/
    warrior_one/    ← training image dataset
    tree_pose/
  test/
    warrior_one/    ← test image dataset
    tree_pose/
```

### Step 2: Extract Keypoints
Run the pre-processing script to convert those images into pure coordinate data.
```bash
python scripts/preprocess.py
```

### Step 3: Train the Classifier
Run the training script to teach the neural network how to identify poses based on the coordinates.
```bash
python scripts/train.py
```

### Step 4: Configure Reference Angles
Update `app/data/pose_references.json` with the ideal anatomical joint angles corresponding to the poses you've trained.

### Step 5: Start the API Server
Launch the FastAPI application.
```bash
fastapi dev app/main.py
```

### Step 6: Stream Live Data (Frontend)
Your frontend (React, Vue, etc.) opens a WebSocket connection to `ws://localhost:8000/pose/stream`, starts the user's webcam and begins pinging JPEG images off to the server, displaying the resulting JSON feedback in real-time.

(Optionally, you can also use `POST /pose/classify` to classify singular, static images).

---
*Note: This architecture intentionally places the heavy AI workload onto the backend. The frontend remains extremely lightweight, only responsible for pulling webcam frames and rendering JSON graphics, making it highly portable to simpler devices.*
