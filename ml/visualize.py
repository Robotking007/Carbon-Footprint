"""
Feature importance visualization using SHAP-like analysis.
Generates contribution charts for carbon emission predictions.
"""

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import os
import json

from models import CarbonFootprintPredictor, generate_synthetic_data


def plot_feature_importance(predictor, model_name='random_forest', save_dir='plots'):
    """Plot feature importance for a trained model."""
    os.makedirs(save_dir, exist_ok=True)
    model = predictor.models.get(model_name)
    if model is None:
        print(f"Model {model_name} not found")
        return

    # Generate reference data
    df = generate_synthetic_data(1000)
    X = predictor.prepare_features(df)

    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    elif hasattr(model, 'coef_'):
        importances = np.abs(model.coef_)
    else:
        print("Model does not support feature importance")
        return

    feat_df = pd.DataFrame({
        'Feature': X.columns,
        'Importance': importances
    }).sort_values('Importance', ascending=True)

    fig, ax = plt.subplots(figsize=(10, 6))
    colors = sns.color_palette('Greens_r', len(feat_df))
    ax.barh(feat_df['Feature'], feat_df['Importance'], color=colors)
    ax.set_xlabel('Importance Score')
    ax.set_title(f'Feature Importance — {model_name.replace("_", " ").title()}')
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, f'feature_importance_{model_name}.png'), dpi=150)
    plt.close()
    print(f"Saved: {save_dir}/feature_importance_{model_name}.png")


def plot_category_contributions(save_dir='plots'):
    """Plot average emission by category (SHAP-like contribution)."""
    os.makedirs(save_dir, exist_ok=True)
    df = generate_synthetic_data(3000)

    category_stats = df.groupby('category')['totalEmission'].agg(['mean', 'std', 'count'])
    category_stats = category_stats.sort_values('mean', ascending=True)

    fig, ax = plt.subplots(figsize=(10, 6))
    colors = {
        'travel': '#3b82f6', 'electricity': '#eab308', 'food': '#22c55e',
        'streaming': '#a855f7', 'waste': '#6b7280', 'shopping': '#ec4899'
    }
    bar_colors = [colors.get(c, '#888') for c in category_stats.index]
    ax.barh(category_stats.index, category_stats['mean'], xerr=category_stats['std'],
            color=bar_colors, capsize=5, edgecolor='white', linewidth=1.5)
    ax.set_xlabel('Average Emission (kg CO₂)')
    ax.set_title('Category Contribution to Carbon Footprint')

    for i, (cat, row) in enumerate(category_stats.iterrows()):
        ax.text(row['mean'] + row['std'] + 0.1, i, f"{row['mean']:.2f} kg",
                va='center', fontsize=9, fontweight='bold')

    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'category_contributions.png'), dpi=150)
    plt.close()
    print(f"Saved: {save_dir}/category_contributions.png")


def plot_prediction_vs_actual(predictor, save_dir='plots'):
    """Scatter plot of predicted vs actual emissions."""
    os.makedirs(save_dir, exist_ok=True)
    df = generate_synthetic_data(1000)
    X = predictor.prepare_features(df)
    y_true = df['totalEmission'].values

    fig, axes = plt.subplots(1, len(predictor.models), figsize=(6 * len(predictor.models), 5))
    if len(predictor.models) == 1:
        axes = [axes]

    for ax, (name, model) in zip(axes, predictor.models.items()):
        X_input = predictor.scaler.transform(X) if name == 'ridge' else X
        y_pred = np.maximum(model.predict(X_input), 0)

        ax.scatter(y_true, y_pred, alpha=0.3, s=10, c='#22c55e')
        max_val = max(y_true.max(), y_pred.max())
        ax.plot([0, max_val], [0, max_val], 'r--', alpha=0.7, label='Perfect')
        ax.set_xlabel('Actual (kg CO₂)')
        ax.set_ylabel('Predicted (kg CO₂)')
        ax.set_title(f'{name.replace("_", " ").title()}')
        ax.legend()

    plt.suptitle('Predicted vs Actual Carbon Emissions', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'prediction_vs_actual.png'), dpi=150)
    plt.close()
    print(f"Saved: {save_dir}/prediction_vs_actual.png")


if __name__ == '__main__':
    print("Training models for visualization...")
    df = generate_synthetic_data(3000)
    predictor = CarbonFootprintPredictor(model_dir='saved_models')
    predictor.train(df)

    print("\nGenerating visualizations...")
    plot_feature_importance(predictor, 'random_forest')
    plot_category_contributions()
    plot_prediction_vs_actual(predictor)
    print("\n✅ All plots saved to plots/ directory")
