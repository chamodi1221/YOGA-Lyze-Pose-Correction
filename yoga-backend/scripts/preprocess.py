"""CLI script: extract keypoints from training images and write to CSV.

Usage:
    python scripts/preprocess.py \
        --train_dir datasets/train \
        --test_dir  datasets/test \
        --train_csv train_data.csv \
        --test_csv  test_data.csv
"""

import argparse
import sys
import os

# Allow running from the project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.preprocess import Preprocessor


def main():
    parser = argparse.ArgumentParser(description='Extract MoveNet keypoints to CSV')
    parser.add_argument('--train_dir', default='datasets/train')
    parser.add_argument('--test_dir',  default='datasets/test')
    parser.add_argument('--train_csv', default='train_data.csv')
    parser.add_argument('--test_csv',  default='test_data.csv')
    parser.add_argument('--threshold', type=float, default=0.1,
                        help='Min keypoint score to keep an image')
    args = parser.parse_args()

    print('=== Preprocessing TRAINING data ===')
    train_pre = Preprocessor(args.train_dir, args.train_csv)
    train_pre.process(detection_threshold=args.threshold)

    print('\n=== Preprocessing TEST data ===')
    test_pre = Preprocessor(args.test_dir, args.test_csv)
    test_pre.process(detection_threshold=args.threshold)

    print('\nDone! Run scripts/train.py next.')


if __name__ == '__main__':
    main()
