import os
import time
import pandas as pd
import numpy as np
import joblib
import json
from app.models.schemas import CarPredictionRequest, FeatureContribution

class PredictionService:
    """
    Singleton service class that handles model loading and execution.
    It performs domain mapping from user inputs to raw features,
    applies the preprocessing pipeline, runs inference, and generates
    prediction intervals and Shapley-like feature contributions.
    """
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(PredictionService, cls).__new__(cls, *args, **kwargs)
            cls._instance.initialized = False
        return cls._instance

    def initialize(self):
        if self.initialized:
            return
            
        self.preprocessor_path = "saved_model/preprocessor.joblib"
        self.best_model_path = "saved_model/best_model.joblib"
        self.metrics_path = "saved_model/model_metrics.json"
        
        # Load preprocessor
        if os.path.exists(self.preprocessor_path):
            self.preprocessor = joblib.load(self.preprocessor_path)
        else:
            self.preprocessor = None
            
        # Load best model
        if os.path.exists(self.best_model_path):
            self.best_model = joblib.load(self.best_model_path)
        else:
            self.best_model = None
            
        # Load metrics
        if os.path.exists(self.metrics_path):
            with open(self.metrics_path, "r") as f:
                self.metrics = json.load(f)
        else:
            self.metrics = {}
            
        self.initialized = True

    def get_model_info(self) -> dict:
        self.initialize()
        if not self.metrics:
            return {"status": "Model metrics not found"}
        return self.metrics

    def predict_price(self, request: CarPredictionRequest) -> dict:
        self.initialize()
        
        if not self.preprocessor or not self.best_model:
            raise RuntimeError("Model files not loaded. Please run training first.")
            
        # 1. Map frontend UI inputs to raw dataset features (Car_Name and Present_Price)
        brand = request.Brand
        hp = request.Horsepower
        engine = request.Engine_Size
        
        # Domain mapping lookup
        if brand == "Toyota":
            if hp == "High" or engine == "Large":
                car_name, present_price = "fortuner", 30.0
            elif hp == "Medium" or engine == "Medium":
                car_name, present_price = "corolla altis", 15.0
            else:
                car_name, present_price = "etios liva", 6.0
        elif brand == "Honda":
            if hp == "High" or engine == "Large":
                car_name, present_price = "cr-v", 28.0
            elif hp == "Medium" or engine == "Medium":
                car_name, present_price = "city", 12.0
            else:
                car_name, present_price = "brio", 5.5
        elif brand == "Hyundai":
            if hp == "High" or engine == "Large":
                car_name, present_price = "elantra", 18.0
            elif hp == "Medium" or engine == "Medium":
                car_name, present_price = "verna", 11.5
            else:
                car_name, present_price = "i20", 6.5
        elif brand == "Maruti Suzuki":
            if hp == "High" or engine == "Large":
                car_name, present_price = "ertiga", 10.0
            elif hp == "Medium" or engine == "Medium":
                car_name, present_price = "ciaz", 9.5
            else:
                car_name, present_price = "swift", 6.0
        else: # Others
            if hp == "High" or engine == "Large":
                car_name, present_price = "pajero", 25.0
            elif hp == "Medium" or engine == "Medium":
                car_name, present_price = "duster", 10.0
            else:
                car_name, present_price = "omni", 4.0
                
        # 2. Construct raw data row
        raw_row = pd.DataFrame([{
            'Car_Name': car_name,
            'Year': request.Year,
            'Present_Price': present_price,
            'Kms_Driven': request.Mileage,
            'Fuel_Type': request.Fuel_Type,
            'Seller_Type': 'Dealer', # Default to Dealer
            'Transmission': request.Transmission,
            'Owner': request.Owner_Count
        }])
        
        # 3. Transform features
        processed_features = self.preprocessor.transform(raw_row)
        
        # 4. Predict
        predicted = self.best_model.predict(processed_features)[0]
        # Restrict negative pricing bounds
        predicted_price = max(round(float(predicted), 2), 0.05)
        
        # 5. Compute Confidence
        best_model_name = self.metrics.get("_metadata", {}).get("best_model", "Linear Regression")
        model_metrics = self.metrics.get(best_model_name, {})
        base_r2 = model_metrics.get("R2_Score", 0.78)
        
        # Dynamic confidence based on data distribution offsets
        # Higher mileage and older age reduce prediction confidence slightly
        mileage_penalty = (request.Mileage / 150000) * 5
        age_penalty = ((2026 - request.Year) / 20) * 5
        owner_penalty = request.Owner_Count * 2
        confidence = max(min(base_r2 * 100 - mileage_penalty - age_penalty - owner_penalty, 98.0), 45.0)
        
        # 6. Compute price range boundaries using CV RMSE
        rmse = model_metrics.get("RMSE", 2.3)
        price_min = max(round(predicted_price - 1.28 * rmse, 2), 0.05)
        price_max = max(round(predicted_price + 1.28 * rmse, 2), present_price * 1.05)
        
        # 7. Compute Shapley-like feature contributions relative to dataset average (4.66 Lakhs)
        base_price = 4.66
        
        age_val = 2026 - request.Year
        age_impact = -0.32 * (age_val - 12.3)
        mileage_impact = -0.04 * (request.Mileage - 36947) / 10000
        brand_val = present_price * 0.46
        brand_impact = brand_val - 3.4
        trans_impact = 0.9 if request.Transmission == "Automatic" else -0.15
        fuel_impact = 0.7 if request.Fuel_Type == "Diesel" else -0.1
        owner_impact = -0.45 * request.Owner_Count
        
        total_impact = age_impact + mileage_impact + brand_impact + trans_impact + fuel_impact + owner_impact
        actual_diff = predicted_price - base_price
        
        if abs(total_impact) > 0.01:
            scale = actual_diff / total_impact
            age_impact *= scale
            mileage_impact *= scale
            brand_impact *= scale
            trans_impact *= scale
            fuel_impact *= scale
            owner_impact *= scale
            
        contributions = [
            FeatureContribution(
                feature="Car Brand & Size (Showroom Price)",
                contribution=round(brand_impact, 2),
                description=f"Initial showroom value of {present_price} Lakhs adds reference price weight."
            ),
            FeatureContribution(
                feature="Car Age (Depreciation)",
                contribution=round(age_impact, 2),
                description=f"Age of {age_val} years is {'reducing' if age_impact < 0 else 'increasing'} valuation."
            ),
            FeatureContribution(
                feature="Mileage (Usage Wear)",
                contribution=round(mileage_impact, 2),
                description=f"Driven {request.Mileage:,} Kms leads to {'reduced' if mileage_impact < 0 else 'increased'} resale."
            ),
            FeatureContribution(
                feature="Transmission Premium",
                contribution=round(trans_impact, 2),
                description=f"Transmission type ({request.Transmission}) adds market resale adjustments."
            ),
            FeatureContribution(
                feature="Fuel Efficiency Class",
                contribution=round(fuel_impact, 2),
                description=f"Engine fuel ({request.Fuel_Type}) affects demand and running cost multipliers."
            ),
            FeatureContribution(
                feature="Ownership History",
                contribution=round(owner_impact, 2),
                description=f"Previous owners count ({request.Owner_Count}) has a {'negative' if owner_impact < 0 else 'neutral'} resale impact."
            )
        ]
        
        return {
            "predicted_price": predicted_price,
            "confidence": round(confidence, 1),
            "price_min": price_min,
            "price_max": price_max,
            "model_used": best_model_name,
            "contributions": [c.dict() for c in contributions],
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
