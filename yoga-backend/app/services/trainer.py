import csv
import json
import os

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow import keras

from app.services.dataset_builder import BodyPart


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_csv(csv_path: str):
    """Load preprocessed landmark CSV.

    Returns:
        X (DataFrame): landmark features
        y (ndarray): one-hot encoded labels
        class_names (list[str]): ordered list of class names
    """
    df = pd.read_csv(csv_path)
    df.drop(['filename'], axis=1, inplace=True)
    class_names = sorted(df['class_name'].unique().tolist())
    # Build numeric label from sorted class list so train/test share the same mapping
    df['class_no'] = df['class_name'].map({name: i for i, name in enumerate(class_names)})
    df.drop(['class_name'], axis=1, inplace=True)

    y = df.pop('class_no')
    X = df.astype('float64')
    y = keras.utils.to_categorical(y, num_classes=len(class_names))

    return X, y, class_names


# ---------------------------------------------------------------------------
# Landmark normalisation (must match inference-time pipeline)
# ---------------------------------------------------------------------------

def get_center_point(landmarks, left_bodypart: BodyPart, right_bodypart: BodyPart):
    """Calculates the centre point of two given landmarks."""
    left = tf.gather(landmarks, left_bodypart.value, axis=1)
    right = tf.gather(landmarks, right_bodypart.value, axis=1)
    return left * 0.5 + right * 0.5


def get_pose_size(landmarks, torso_size_multiplier=2.5):
    """Calculates pose size as the max of torso size and max landmark distance."""
    hips_center = get_center_point(landmarks, BodyPart.LEFT_HIP, BodyPart.RIGHT_HIP)
    shoulders_center = get_center_point(
        landmarks, BodyPart.LEFT_SHOULDER, BodyPart.RIGHT_SHOULDER
    )
    torso_size = tf.linalg.norm(shoulders_center - hips_center)

    pose_center = get_center_point(landmarks, BodyPart.LEFT_HIP, BodyPart.RIGHT_HIP)
    pose_center = tf.expand_dims(pose_center, axis=1)
    pose_center = tf.broadcast_to(
        pose_center, [tf.size(landmarks) // (17 * 2), 17, 2]
    )

    d = tf.gather(landmarks - pose_center, 0, axis=0, name='dist_to_pose_center')
    max_dist = tf.reduce_max(tf.linalg.norm(d, axis=0))
    return tf.maximum(torso_size * torso_size_multiplier, max_dist)


def normalize_pose_landmarks(landmarks):
    """Centres pose on hip midpoint and normalises scale."""
    pose_center = get_center_point(landmarks, BodyPart.LEFT_HIP, BodyPart.RIGHT_HIP)
    pose_center = tf.expand_dims(pose_center, axis=1)
    pose_center = tf.broadcast_to(
        pose_center, [tf.size(landmarks) // (17 * 2), 17, 2]
    )
    landmarks = landmarks - pose_center
    pose_size = get_pose_size(landmarks)
    return landmarks / pose_size


def landmarks_to_embedding(landmarks_and_scores):
    """Converts flat [51] landmark vector to a normalised [34] embedding."""
    reshaped = keras.layers.Reshape((17, 3))(landmarks_and_scores)
    landmarks = normalize_pose_landmarks(reshaped[:, :, :2])
    return keras.layers.Flatten()(landmarks)


def preprocess_data(X: pd.DataFrame) -> tf.Tensor:
    """Converts a DataFrame of raw landmarks into normalised embeddings."""
    embeddings = []
    for i in range(X.shape[0]):
        raw = tf.reshape(tf.convert_to_tensor(X.iloc[i], dtype=tf.float32), (1, 51))
        emb = landmarks_to_embedding(raw)
        embeddings.append(tf.reshape(emb, (34,)))
    return tf.convert_to_tensor(embeddings)


# ---------------------------------------------------------------------------
# Model definition
# ---------------------------------------------------------------------------

def build_model(num_classes: int) -> keras.Model:
    inputs = keras.Input(shape=(34,))
    x = keras.layers.Dense(128, activation='relu6')(inputs)
    x = keras.layers.Dropout(0.5)(x)
    x = keras.layers.Dense(64, activation='relu6')(x)
    x = keras.layers.Dropout(0.5)(x)
    outputs = keras.layers.Dense(num_classes, activation='softmax')(x)
    model = keras.Model(inputs, outputs)
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )
    return model


# ---------------------------------------------------------------------------
# Training entrypoint (called by scripts/train.py)
# ---------------------------------------------------------------------------

def run_training(
    train_csv: str,
    test_csv: str,
    output_dir: str,
    epochs: int = 200,
    batch_size: int = 16,
):
    os.makedirs(output_dir, exist_ok=True)

    print('Loading CSVs…')
    X, y, class_names = load_csv(train_csv)
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15)
    X_test, y_test, _ = load_csv(test_csv)

    print('Preprocessing landmarks…')
    processed_X_train = preprocess_data(X_train)
    processed_X_val = preprocess_data(X_val)
    processed_X_test = preprocess_data(X_test)

    model = build_model(num_classes=len(class_names))

    checkpoint_path = os.path.join(output_dir, 'weights_best.keras')
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            checkpoint_path,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1,
        ),
        keras.callbacks.EarlyStopping(monitor='val_accuracy', patience=20),
    ]

    print('── TRAINING ──')
    model.fit(
        processed_X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_data=(processed_X_val, y_val),
        callbacks=callbacks,
    )

    print('── EVALUATION ──')
    loss, accuracy = model.evaluate(processed_X_test, y_test)
    print(f'Loss: {loss:.4f}  Accuracy: {accuracy:.4f}')

    # Save final model and class names
    model_path = os.path.join(output_dir, 'pose_classifier.keras')
    model.save(model_path)
    print(f'Model saved → {model_path}')

    class_names_path = os.path.join(output_dir, 'class_names.json')
    with open(class_names_path, 'w') as f:
        json.dump(class_names, f, indent=2)
    print(f'Class names saved → {class_names_path}')

    return model, class_names
