import os
import pandas as pd
import joblib
from app.services.preprocessing import clean_raw_data, get_preprocessing_pipeline, CarFeatureEngineer

def main():
    print("Starting data preprocessing pipeline...")
    
    # 1. Paths configuration
    raw_path = "dataset/raw/car_data.csv"
    processed_dir = "dataset/processed"
    processed_csv_path = os.path.join(processed_dir, "cleaned_car_data.csv")
    model_dir = "saved_model"
    preprocessor_path = os.path.join(model_dir, "preprocessor.joblib")
    
    os.makedirs(processed_dir, exist_ok=True)
    os.makedirs(model_dir, exist_ok=True)
    
    if not os.path.exists(raw_path):
        print(f"Error: Raw dataset not found at {raw_path}")
        return
        
    # 2. Load raw data
    raw_df = pd.read_csv(raw_path)
    print(f"Raw dataset shape: {raw_df.shape}")
    
    # 3. Clean raw data (duplicates, types)
    cleaned_df = clean_raw_data(raw_df)
    print(f"Cleaned dataset shape (duplicates removed): {cleaned_df.shape}")
    
    # 4. Generate engineered dataset to inspect features
    engineer = CarFeatureEngineer()
    engineered_df = engineer.transform(cleaned_df)
    print(f"Engineered dataset shape: {engineered_df.shape}")
    
    # Save the engineered dataset as a CSV
    engineered_df.to_csv(processed_csv_path, index=False)
    print(f"Engineered dataset saved to {processed_csv_path}")
    
    # 5. Fit the full preprocessing pipeline (Numerical scaling + Categorical One-Hot Encoding)
    pipeline = get_preprocessing_pipeline()
    # Fit the pipeline on X. Note: We fit on X to get the column transformations, y is Selling_Price
    X = cleaned_df.drop(columns=['Selling_Price'])
    pipeline.fit(X)
    
    # Save preprocessing pipeline
    joblib.dump(pipeline, preprocessor_path)
    print(f"Preprocessing pipeline serialized and saved to {preprocessor_path}")
    print("Preprocessing successfully completed!")

if __name__ == "__main__":
    # Ensure current directory matches workspace root when running
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    main()
