"""
Carbon Footprint Prediction Models
====================================
Implements Ridge Regression, Random Forest, and XGBoost for
predicting individual carbon emissions based on activity data.

Research-backed approach from:
- Wiedmann & Minx (2007) - Definition of carbon footprints
- IPCC Emission Factor Database
- India GHG Programme
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os
import json

try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    print("Warning: XGBoost not installed. Skipping XGBoost model.")


class CarbonFootprintPredictor:
    """Multi-model carbon emission predictor."""

    def __init__(self, model_dir='saved_models'):
        self.model_dir = model_dir
        os.makedirs(model_dir, exist_ok=True)
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.models = {}
        self.metrics = {}

    def prepare_features(self, df):
        """Convert raw carbon records to ML features."""
        features = pd.DataFrame()

        # Time-based features
        features['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
        features['month'] = pd.to_datetime(df['date']).dt.month
        features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)

        # Category encoding
        if 'category' in df.columns:
            if 'category' not in self.label_encoders:
                self.label_encoders['category'] = LabelEncoder()
                features['category_encoded'] = self.label_encoders['category'].fit_transform(df['category'])
            else:
                features['category_encoded'] = self.label_encoders['category'].transform(df['category'])

        # Travel features
        features['travel_distance'] = df.get('travel_distance', 0).fillna(0)

        # Electricity features
        features['electricity_usage'] = df.get('electricity_usage', 0).fillna(0)

        # Food features
        features['food_items_count'] = df.get('food_items_count', 0).fillna(0)

        # Streaming features
        features['streaming_hours'] = df.get('streaming_hours', 0).fillna(0)

        # Aggregated historical features (rolling averages)
        if 'user_avg_7d' in df.columns:
            features['user_avg_7d'] = df['user_avg_7d'].fillna(0)
        if 'user_avg_30d' in df.columns:
            features['user_avg_30d'] = df['user_avg_30d'].fillna(0)

        return features.fillna(0)

    def train(self, df, target_col='totalEmission'):
        """Train all models on the dataset."""
        print("=" * 60)
        print("Carbon Footprint Prediction Model Training")
        print("=" * 60)

        X = self.prepare_features(df)
        y = df[target_col].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # 1. Ridge Regression (Baseline)
        print("\n--- Ridge Regression ---")
        ridge = Ridge(alpha=1.0)
        ridge.fit(X_train_scaled, y_train)
        self.models['ridge'] = ridge
        self._evaluate(ridge, X_test_scaled, y_test, 'ridge', X.columns)

        # 2. Random Forest
        print("\n--- Random Forest ---")
        rf = RandomForestRegressor(
            n_estimators=100, max_depth=10,
            min_samples_split=5, random_state=42, n_jobs=-1
        )
        rf.fit(X_train, y_train)
        self.models['random_forest'] = rf
        self._evaluate(rf, X_test, y_test, 'random_forest', X.columns)

        # 3. XGBoost
        if HAS_XGBOOST:
            print("\n--- XGBoost ---")
            xgb = XGBRegressor(
                n_estimators=200, max_depth=6,
                learning_rate=0.1, subsample=0.8,
                colsample_bytree=0.8, random_state=42
            )
            xgb.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
            self.models['xgboost'] = xgb
            self._evaluate(xgb, X_test, y_test, 'xgboost', X.columns)

        # Cross-validation on best model
        best_model_name = min(self.metrics, key=lambda k: self.metrics[k]['rmse'])
        print(f"\n{'=' * 60}")
        print(f"Best Model: {best_model_name} (RMSE: {self.metrics[best_model_name]['rmse']:.4f})")
        print(f"{'=' * 60}")

        # Save models
        self._save_models()
        return self.metrics

    def _evaluate(self, model, X_test, y_test, name, feature_names):
        """Evaluate a model and store metrics."""
        y_pred = model.predict(X_test)
        y_pred = np.maximum(y_pred, 0)  # Emissions can't be negative

        metrics = {
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred),
        }
        self.metrics[name] = metrics

        print(f"  RMSE: {metrics['rmse']:.4f}")
        print(f"  MAE:  {metrics['mae']:.4f}")
        print(f"  R²:   {metrics['r2']:.4f}")

        # Feature importance
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feat_imp = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
            print(f"  Top Features: {', '.join([f'{f[0]}({f[1]:.3f})' for f in feat_imp[:5]])}")
        elif hasattr(model, 'coef_'):
            coefs = np.abs(model.coef_)
            feat_imp = sorted(zip(feature_names, coefs), key=lambda x: x[1], reverse=True)
            print(f"  Top Features: {', '.join([f'{f[0]}({f[1]:.3f})' for f in feat_imp[:5]])}")

    def predict(self, df, model_name='random_forest'):
        """Predict emissions for new data."""
        X = self.prepare_features(df)
        model = self.models.get(model_name)
        if model is None:
            raise ValueError(f"Model '{model_name}' not found. Available: {list(self.models.keys())}")

        if model_name == 'ridge':
            X = self.scaler.transform(X)

        predictions = model.predict(X)
        return np.maximum(predictions, 0)

    def _save_models(self):
        """Save trained models to disk."""
        joblib.dump(self.scaler, os.path.join(self.model_dir, 'scaler.pkl'))
        joblib.dump(self.label_encoders, os.path.join(self.model_dir, 'label_encoders.pkl'))
        for name, model in self.models.items():
            joblib.dump(model, os.path.join(self.model_dir, f'{name}_model.pkl'))
        with open(os.path.join(self.model_dir, 'metrics.json'), 'w') as f:
            json.dump(self.metrics, f, indent=2)
        print(f"\nModels saved to {self.model_dir}/")

    def load_models(self):
        """Load pre-trained models from disk."""
        self.scaler = joblib.load(os.path.join(self.model_dir, 'scaler.pkl'))
        self.label_encoders = joblib.load(os.path.join(self.model_dir, 'label_encoders.pkl'))
        for name in ['ridge', 'random_forest', 'xgboost']:
            path = os.path.join(self.model_dir, f'{name}_model.pkl')
            if os.path.exists(path):
                self.models[name] = joblib.load(path)
        with open(os.path.join(self.model_dir, 'metrics.json')) as f:
            self.metrics = json.load(f)
        print(f"Loaded {len(self.models)} models from {self.model_dir}/")


def generate_synthetic_data(n_samples=5000):
    """Generate synthetic carbon emission data for training."""
    np.random.seed(42)

    categories = ['travel', 'electricity', 'food', 'streaming', 'waste', 'shopping']
    dates = pd.date_range(end=pd.Timestamp.now(), periods=180, freq='D')

    records = []
    for _ in range(n_samples):
        cat = np.random.choice(categories, p=[0.25, 0.2, 0.25, 0.1, 0.1, 0.1])
        date = np.random.choice(dates)

        record = {
            'date': date,
            'category': cat,
            'travel_distance': np.random.exponential(15) if cat == 'travel' else 0,
            'electricity_usage': np.random.exponential(8) if cat == 'electricity' else 0,
            'food_items_count': np.random.randint(1, 6) if cat == 'food' else 0,
            'streaming_hours': np.random.exponential(2) if cat == 'streaming' else 0,
        }

        # Calculate emission based on factors
        emission = 0
        if cat == 'travel':
            emission = record['travel_distance'] * np.random.choice([0.21, 0.17, 0.05, 0.14])
        elif cat == 'electricity':
            emission = record['electricity_usage'] * np.random.choice([0.82, 0.42, 0.23])
        elif cat == 'food':
            emission = record['food_items_count'] * np.random.choice([0.5, 1.2, 2.5, 7.0])
        elif cat == 'streaming':
            emission = record['streaming_hours'] * np.random.choice([0.036, 0.015, 0.055])
        elif cat == 'waste':
            emission = np.random.exponential(1.5)
        elif cat == 'shopping':
            emission = np.random.exponential(5)

        # Add noise
        emission = max(0, emission + np.random.normal(0, emission * 0.1))
        record['totalEmission'] = round(emission, 3)
        records.append(record)

    return pd.DataFrame(records)


if __name__ == '__main__':
    print("Generating synthetic training data...")
    df = generate_synthetic_data(5000)
    print(f"Dataset: {len(df)} records, {df['category'].nunique()} categories")
    print(f"Emission range: {df['totalEmission'].min():.2f} - {df['totalEmission'].max():.2f} kg CO₂")
    print(f"Mean emission: {df['totalEmission'].mean():.2f} kg CO₂\n")

    predictor = CarbonFootprintPredictor(model_dir='saved_models')
    metrics = predictor.train(df)

    # Test prediction
    test_data = pd.DataFrame([{
        'date': '2024-03-15',
        'category': 'travel',
        'travel_distance': 20,
        'electricity_usage': 0,
        'food_items_count': 0,
        'streaming_hours': 0,
    }])
    prediction = predictor.predict(test_data)
    print(f"\nTest prediction (20km travel): {prediction[0]:.2f} kg CO₂")
