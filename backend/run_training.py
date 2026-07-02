import os
import sys
import pandas as pd
from app.services.training import train_and_evaluate_models

def main():
    # Make sure backend folder is in path for modules
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    print("=" * 60)
    print("           CAR PRICE PREDICTION - MODEL TRAINING            ")
    print("=" * 60)
    
    try:
        metrics = train_and_evaluate_models()
        
        # Display comparison table
        print("\n" + "=" * 80)
        print(f"{'Model Name':<22} | {'R2 Score':<8} | {'CV Score':<8} | {'MAE':<6} | {'RMSE':<6} | {'Train (s)':<8} | {'Pred (s)':<8}")
        print("=" * 80)
        
        metadata = metrics.pop("_metadata")
        
        for model_name, data in sorted(metrics.items(), key=lambda x: x[1]["R2_Score"], reverse=True):
            print(f"{model_name:<22} | {data['R2_Score']:<8.4f} | {data['CV_Score']:<8.4f} | {data['MAE']:<6.3f} | {data['RMSE']:<6.3f} | {data['Training_Time']:<8.4f} | {data['Prediction_Time']:<8.6f}")
            
        print("=" * 80)
        print(f"Best Performing Model: {metadata['best_model']}")
        print(f"Dataset Size: {metadata['sample_size']} listings")
        print("All models successfully saved in saved_model/ directory.")
        print("=" * 80)
        
    except Exception as e:
        print(f"Training failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
