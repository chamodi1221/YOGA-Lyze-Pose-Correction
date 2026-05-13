import tensorflow as tf
import numpy as np
import pandas as pd
import os
import csv
import tqdm

from app.services.movenet import Movement
from app.services.dataset_builder import BodyPart

# Lazy-loaded singleton — only created when actually used
_movenet_model: Movement | None = None


def _get_model() -> Movement:
    global _movenet_model
    if _movenet_model is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'movenet_thunder.tflite')
        model_path = os.path.abspath(model_path)
        _movenet_model = Movement(model_path)
    return _movenet_model


def detect(input_tensor, inference_count=3):
    """Run MoveNet inference multiple times to warm-up the smart crop region."""
    model = _get_model()
    # First call resets the crop region
    model.detect(input_tensor.numpy(), reset_crop_region=True)

    detection = None
    for _ in range(inference_count - 1):
        detection = model.detect(input_tensor.numpy(), reset_crop_region=False)

    # Fallback — in case inference_count == 1
    if detection is None:
        detection = model.detect(input_tensor.numpy(), reset_crop_region=False)

    return detection


class Preprocessor(object):
    """Preprocesses pose images — detects keypoints and saves them to CSV."""

    def __init__(self, images_in_folder: str, csvs_out_path: str):
        self._images_in_folder = images_in_folder
        self._csvs_out_path = csvs_out_path
        self._csvs_out_folder_per_class = 'csv_per_pose'
        self._message = []

        if not os.path.exists(self._csvs_out_folder_per_class):
            os.makedirs(self._csvs_out_folder_per_class)

        # Get sorted list of pose class folder names
        self._pose_class_names = sorted(
            [n for n in os.listdir(images_in_folder)
             if os.path.isdir(os.path.join(images_in_folder, n))]
        )

    def process(self, detection_threshold=0.1):
        """Preprocess images in the given folder — detects & writes keypoints to CSVs."""
        for pose_class_name in self._pose_class_names:
            images_in_folder = os.path.join(self._images_in_folder, pose_class_name)
            csv_out_path = os.path.join(
                self._csvs_out_folder_per_class, pose_class_name + '.csv'
            )

            with open(csv_out_path, 'w', newline='') as csv_out_file:
                csv_out_writer = csv.writer(
                    csv_out_file, delimiter=',', quoting=csv.QUOTE_MINIMAL
                )

                image_names = sorted([
                    n for n in os.listdir(images_in_folder)
                    if not n.startswith('.')
                ])

                valid_image_count = 0

                for image_name in tqdm.tqdm(image_names, desc=pose_class_name):
                    image_path = os.path.join(images_in_folder, image_name)

                    try:
                        image = tf.io.read_file(image_path)
                        image = tf.io.decode_jpeg(image)
                    except Exception:
                        self._message.append(f'Skipped {image_path}: Invalid image')
                        continue

                    # Skip non-RGB images
                    if image.shape[2] != 3:
                        self._message.append(f'Skipped {image_path}: Not RGB')
                        continue

                    person = detect(image)

                    # Only keep images where all keypoints exceed the threshold
                    min_landmark_score = min(
                        kp.score for kp in person.keypoints
                    )
                    if min_landmark_score < detection_threshold:
                        self._message.append(
                            f'Skipped {image_path}: Keypoint scores below threshold'
                        )
                        continue

                    valid_image_count += 1

                    pose_landmarks = np.array(
                        [[kp.coordinate.x, kp.coordinate.y, kp.score]
                         for kp in person.keypoints],
                        dtype=np.float32
                    )

                    # Flatten [17, 3] → list of strings, prepend filename
                    coord = pose_landmarks.flatten().astype(str).tolist()
                    csv_out_writer.writerow([image_name] + coord)

                print(f'{pose_class_name}: {valid_image_count} valid images')

        if self._message:
            print('\n'.join(self._message))

        # Merge all per-class CSVs into one
        all_landmarks_df = self._all_landmarks_as_dataframe()
        all_landmarks_df.to_csv(self._csvs_out_path, index=False)
        print(f'Saved combined CSV to {self._csvs_out_path}')

    @property
    def class_names(self):
        return self._pose_class_names

    def _all_landmarks_as_dataframe(self) -> pd.DataFrame:
        """Merges per-class CSVs into one DataFrame with labelled columns."""
        total_df = None

        for class_index, class_name in enumerate(self._pose_class_names):
            csv_out_path = os.path.join(
                self._csvs_out_folder_per_class, class_name + '.csv'
            )
            per_class_df = pd.read_csv(csv_out_path, header=None)
            per_class_df['class_no'] = class_index
            per_class_df['class_name'] = class_name
            per_class_df[per_class_df.columns[0]] = (
                class_name + '/' + per_class_df[per_class_df.columns[0]]
            )

            total_df = per_class_df if total_df is None else pd.concat(
                [total_df, per_class_df], axis=0
            )

        # Build column header: filename, NOSE_x, NOSE_y, NOSE_score, ...
        lm_cols = [
            f'{bp.name}_{ax}'
            for bp in BodyPart
            for ax in ('x', 'y', 'score')
        ]
        header_name = ['filename'] + lm_cols + ['class_no', 'class_name']
        total_df.columns = header_name
        return total_df
