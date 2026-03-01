"""
Train ML models using data from MongoDB.
Usage: python train.py [--synthetic] [--samples 5000]
"""

import sys
import os
import argparse
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

from models import CarbonFootprintPredictor, generate_synthetic_data

# Load env from server
env_path = os.path.join(os.path.dirname(__file__), '..', 'server', '.env')
load_dotenv(env_path)


def load_from_mongodb():
    """Load carbon records from MongoDB."""
    uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/carbon-footprint-tracker')
    client = MongoClient(uri)
    db_name = uri.split('/')[-1].split('?')[0]
    db = client[db_name]

    records = list(db.carbonrecords.find({}, {
        'date': 1, 'category': 1, 'totalEmission': 1,
        'travel': 1, 'electricity': 1, 'food': 1, 'streaming': 1,
    }))

    if not records:
        print("No records found in MongoDB.")
        return None

    rows = []
    for r in records:
        row = {
            'date': r.get('date', datetime.now()),
            'category': r.get('category', 'travel'),
            'totalEmission': r.get('totalEmission', 0),
            'travel_distance': r.get('travel', {}).get('distance', 0) or 0,
            'electricity_usage': r.get('electricity', {}).get('usage', 0) or 0,
            'food_items_count': len(r.get('food', {}).get('items', [])),
            'streaming_hours': r.get('streaming', {}).get('hours', 0) or 0,
        }
        rows.append(row)

    client.close()
    return pd.DataFrame(rows)


def main():
    parser = argparse.ArgumentParser(description='Train Carbon Footprint ML Models')
    parser.add_argument('--synthetic', action='store_true', help='Use synthetic data')
    parser.add_argument('--samples', type=int, default=5000, help='Number of synthetic samples')
    args = parser.parse_args()

    if args.synthetic:
        print(f"Using synthetic data ({args.samples} samples)...")
        df = generate_synthetic_data(args.samples)
    else:
        print("Loading data from MongoDB...")
        df = load_from_mongodb()
        if df is None or len(df) < 50:
            print(f"Insufficient data ({len(df) if df is not None else 0} records). Using synthetic data...")
            df = generate_synthetic_data(args.samples)

    print(f"\nDataset Summary:")
    print(f"  Records: {len(df)}")
    print(f"  Categories: {df['category'].value_counts().to_dict()}")
    print(f"  Emission Range: {df['totalEmission'].min():.2f} - {df['totalEmission'].max():.2f} kg CO₂")
    print(f"  Mean Emission: {df['totalEmission'].mean():.2f} kg CO₂")

    predictor = CarbonFootprintPredictor(model_dir='saved_models')
    metrics = predictor.train(df)

    print("\n\nFinal Model Comparison:")
    print("-" * 50)
    for name, m in metrics.items():
        print(f"  {name:15s} | RMSE: {m['rmse']:.4f} | MAE: {m['mae']:.4f} | R²: {m['r2']:.4f}")
    print("-" * 50)

    best = min(metrics, key=lambda k: metrics[k]['rmse'])
    print(f"\n✅ Best Model: {best}")
    print(f"   Saved to: saved_models/")


if __name__ == '__main__':
    main()
