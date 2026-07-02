import os
import time
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.inspection import permutation_importance

try:
    from xgboost import XGBRegressor
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

# Metric labels
METRIC_MAE = "MAE"
METRIC_MSE = "MSE"
METRIC_RMSE = "RMSE"
METRIC_R2 = "R2_Score"
METRIC_CV = "CV_Score"
METRIC_TRAIN_TIME = "Training_Time"
METRIC_PREDICT_TIME = "Prediction_Time"

FEATURE_EXPLANATIONS = {
    "Present_Price": "Showroom price of the car. It has a strong positive effect; a more expensive base model leads to a higher resale price.",
    "Car_Age": "Age of the car. It has a strong negative effect; as the car gets older, it depreciates, decreasing the value.",
    "Kms_Driven": "Odometer reading. It has a negative effect; higher distance driven indicates more wear and tear, reducing value.",
    "Transmission_Automatic": "Automatic transmission indicator. Automatic cars command a price premium in the resale market.",
    "Transmission_Manual": "Manual transmission indicator. Manual cars typically sell for less than automatic equivalents.",
    "Fuel_Type_Diesel": "Diesel engine indicator. Diesel cars generally hold higher resale value and fuel efficiency.",
    "Fuel_Type_Petrol": "Petrol engine indicator. Petrol cars are common and have standard depreciation rates.",
    "Seller_Type_Individual": "Direct individual seller. Cars sold directly by individuals generally have lower prices than dealer listings.",
    "Seller_Type_Dealer": "Dealer seller. Dealers sell cars at a premium because they often include inspection/warranties.",
    "Brand_Toyota": "Toyota cars have excellent brand reputation and build quality, yielding superior resale values.",
    "Brand_Honda": "Honda cars have high reliability reputation, retaining value better than average.",
    "Brand_Maruti Suzuki": "Maruti Suzuki cars are popular with cheap maintenance, keeping demand and resale value stable.",
    "Brand_Hyundai": "Hyundai cars are feature-rich and hold standard to high resale value.",
    "Luxury_Segment_Premium": "Premium segment cars start with a much higher valuation, leading to high absolute resale values.",
    "Luxury_Segment_Budget": "Budget cars depreciate quickly to low pricing points, making them very affordable.",
    "Engine_Category_Large": "Large engines are preferred for luxury/utility vehicles, raising the price.",
    "Engine_Category_Small": "Small engines represent budget commuter cars, keeping prices lower.",
    "Horsepower_Category_High": "High horsepower indicates sports or premium utility performance, commanding a premium.",
    "Owner_Category_First Owner": "First-owner cars command a premium due to single-user care and clean histories.",
    "Owner_Category_Second Owner": "Second-owner cars have slightly lower valuation due to transfer of ownership."
}

def train_and_evaluate_models():
    print("Initiating multi-model training and evaluation...")
    
    # 1. Setup folders and data paths
    data_path = "dataset/processed/cleaned_car_data.csv"
    preprocessor_path = "saved_model/preprocessor.joblib"
    saved_model_dir = "saved_model"
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Cleaned dataset not found at {data_path}")
    if not os.path.exists(preprocessor_path):
        raise FileNotFoundError(f"Fitted preprocessor not found at {preprocessor_path}")
        
    df = pd.read_csv(data_path)
    
    # 2. Split dataset into features X and target y
    X = df.drop(columns=['Selling_Price'])
    y = df['Selling_Price']
    
    # 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Load and transform using preprocessor
    preprocessor = joblib.load(preprocessor_path)
    X_train_processed = preprocessor.transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Get preprocessor column names for feature importances
    # Find feature names from OneHotEncoder and numerical features
    num_features = ['Car_Age', 'Present_Price', 'Kms_Driven']
    cat_encoder = preprocessor.named_steps['preprocessor'].transformers_[1][1]
    cat_features = cat_encoder.get_feature_names_out([
        'Brand', 'Brand_Reputation', 'Mileage_Category', 'Engine_Category', 
        'Horsepower_Category', 'Luxury_Segment', 'Owner_Category', 
        'Fuel_Type', 'Seller_Type', 'Transmission'
    ]).tolist()
    feature_names = num_features + cat_features
    
    # Define models and GridSearchCV parameters
    models_config = {
        "Linear Regression": {
            "model": LinearRegression(),
            "params": {}
        },
        "Ridge Regression": {
            "model": Ridge(),
            "params": {"alpha": [0.1, 1.0, 10.0, 50.0]}
        },
        "Lasso Regression": {
            "model": Lasso(),
            "params": {"alpha": [0.001, 0.01, 0.1, 1.0, 5.0]}
        },
        "Decision Tree": {
            "model": DecisionTreeRegressor(random_state=42),
            "params": {
                "max_depth": [None, 5, 8, 12],
                "min_samples_split": [2, 5, 10]
            }
        },
        "Random Forest": {
            "model": RandomForestRegressor(random_state=42),
            "params": {
                "n_estimators": [50, 100, 200],
                "max_depth": [None, 5, 10],
                "min_samples_split": [2, 5]
            }
        },
        "Gradient Boosting": {
            "model": GradientBoostingRegressor(random_state=42),
            "params": {
                "n_estimators": [50, 100, 150],
                "learning_rate": [0.01, 0.1, 0.2],
                "max_depth": [3, 4, 5]
            }
        },
        "Extra Trees": {
            "model": ExtraTreesRegressor(random_state=42),
            "params": {
                "n_estimators": [50, 100, 150],
                "max_depth": [None, 5, 10]
            }
        }
    }
    
    if XGBOOST_AVAILABLE:
        models_config["Car Price Prediction"] = {
            "model": XGBRegressor(random_state=42, objective='reg:squarederror'),
            "params": {
                "n_estimators": [50, 100, 150],
                "learning_rate": [0.01, 0.1, 0.2],
                "max_depth": [3, 4, 5]
            }
        }
    else:
        print("XGBoost library not found, skipping XGBoost training.")
        
    metrics_summary = {}
    best_model_name = None
    best_r2_score = -np.inf
    trained_estimators = {}
    
    # Train and evaluate each model
    for name, config in models_config.items():
        print(f"Training {name}...")
        model = config["model"]
        params = config["params"]
        
        start_train = time.time()
        
        # GridSearch or simple cross-val
        if params:
            grid = GridSearchCV(model, params, cv=5, scoring='r2', n_jobs=-1)
            grid.fit(X_train_processed, y_train)
            best_estimator = grid.best_estimator_
            cv_score = grid.best_score_
        else:
            # Baseline linear regression
            best_estimator = model
            best_estimator.fit(X_train_processed, y_train)
            cv_score = np.mean(cross_val_score(best_estimator, X_train_processed, y_train, cv=5, scoring='r2'))
            
        train_time = time.time() - start_train
        
        # Test Prediction Time
        start_pred = time.time()
        y_pred = best_estimator.predict(X_test_processed)
        predict_time = time.time() - start_pred
        
        # Evaluate metrics
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        # Store metrics (round values for JSON clean presentation)
        metrics_summary[name] = {
            METRIC_MAE: round(float(mae), 4),
            METRIC_MSE: round(float(mse), 4),
            METRIC_RMSE: round(float(rmse), 4),
            METRIC_R2: round(float(r2), 4),
            METRIC_CV: round(float(cv_score), 4),
            METRIC_TRAIN_TIME: round(float(train_time), 4),
            METRIC_PREDICT_TIME: round(float(predict_time), 6)
        }
        
        trained_estimators[name] = best_estimator
        
        # Save model
        model_filename = name.lower().replace(" ", "_") + ".joblib"
        joblib.dump(best_estimator, os.path.join(saved_model_dir, model_filename))
        
        # Select best model based on Test R2 Score
        if r2 > best_r2_score:
            best_r2_score = r2
            best_model_name = name
            
    print(f"\n--- Best Model Selected: Car Price Prediction (R2: {best_r2_score:.4f}) ---")
    
    # Save best model separately
    best_estimator = trained_estimators[best_model_name]
    joblib.dump(best_estimator, os.path.join(saved_model_dir, "best_model.joblib"))
    
    # Write model_metrics.json
    metrics_summary["_metadata"] = {
        "best_model": best_model_name,
        "xgboost_available": XGBOOST_AVAILABLE,
        "sample_size": len(df),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(os.path.join(saved_model_dir, "model_metrics.json"), "w") as f:
        json.dump(metrics_summary, f, indent=4)
        
    # 3. Calculate Feature Importances for the Best Model
    print("Computing feature importances...")
    # Permutation importance (model-agnostic)
    perm_importance = permutation_importance(
        best_estimator, X_test_processed, y_test, n_repeats=10, random_state=42, scoring='r2'
    )
    
    # Get model-native importances/coefficients if available
    native_importances = None
    if hasattr(best_estimator, 'feature_importances_'):
        native_importances = best_estimator.feature_importances_
    elif hasattr(best_estimator, 'coef_'):
        native_importances = best_estimator.coef_
        
    importance_list = []
    for idx, col_name in enumerate(feature_names):
        perm_mean = perm_importance.importances_mean[idx]
        native_val = float(native_importances[idx]) if native_importances is not None else 0.0
        
        # Map feature explanation
        explanation = "Feature that affects resale price of cars."
        for key, value in FEATURE_EXPLANATIONS.items():
            if col_name == key or col_name.startswith(key):
                explanation = value
                break
                
        importance_list.append({
            "feature": col_name,
            "permutation_importance": round(float(perm_mean), 6),
            "native_importance": round(float(native_val), 6),
            "explanation": explanation
        })
        
    # Sort by permutation importance descending and select top 15
    importance_list = sorted(importance_list, key=lambda x: abs(x["permutation_importance"]), reverse=True)
    top_15_importances = importance_list[:15]
    
    # Write feature_importance.json
    with open(os.path.join(saved_model_dir, "feature_importance.json"), "w") as f:
        json.dump(top_15_importances, f, indent=4)
        
    print("Feature importance calculation completed.")
    return metrics_summary
