"""CLI script: train the yoga pose classifier.

Usage:
    python scripts/train.py \
        --train_csv train_data.csv \
        --test_csv  test_data.csv \
        --output_dir exported_models/
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.trainer import run_training


def main():
    parser = argparse.ArgumentParser(description='Train yoga pose classifier')
    parser.add_argument('--train_csv',   default='train_data.csv')
    parser.add_argument('--test_csv',    default='test_data.csv')
    parser.add_argument('--output_dir',  default='exported_models/')
    parser.add_argument('--epochs',      type=int, default=200)
    parser.add_argument('--batch_size',  type=int, default=16)
    args = parser.parse_args()

    run_training(
        train_csv=args.train_csv,
        test_csv=args.test_csv,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
    )

    print('\nDone! Start the server with: uvicorn app.main:app --reload')


if __name__ == '__main__':
    main()
