import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
import joblib

# Mappings for domain-knowledge feature engineering
BRAND_MAPPING = {
    'ritz': 'Maruti Suzuki', 'sx4': 'Maruti Suzuki', 'ciaz': 'Maruti Suzuki',
    'wagon r': 'Maruti Suzuki', 'swift': 'Maruti Suzuki', 'vitara brezza': 'Maruti Suzuki',
    's cross': 'Maruti Suzuki', 'alto 800': 'Maruti Suzuki', 'ertiga': 'Maruti Suzuki',
    'dzire': 'Maruti Suzuki', 'alto k10': 'Maruti Suzuki', 'ignis': 'Maruti Suzuki',
    'omni': 'Maruti Suzuki', 'baleno': 'Maruti Suzuki', 'brio': 'Honda',
    'city': 'Honda', 'civic': 'Honda', 'accord': 'Honda', 'amaze': 'Honda',
    'jazz': 'Honda', 'cr-v': 'Honda', 'i20': 'Hyundai', 'verna': 'Hyundai',
    'elantra': 'Hyundai', 'creta': 'Hyundai', 'grand i10': 'Hyundai',
    'i10': 'Hyundai', 'eon': 'Hyundai', 'xcent': 'Hyundai', 'fortuner': 'Toyota',
    'innova': 'Toyota', 'etios cross': 'Toyota', 'etios g': 'Toyota',
    'etios liva': 'Toyota', 'corolla altis': 'Toyota', 'camry': 'Toyota',
    'land cruiser': 'Toyota'
}

REPUTATION_MAPPING = {
    'Toyota': 'High', 'Honda': 'High',
    'Maruti Suzuki': 'Medium', 'Hyundai': 'Medium',
    'Others': 'Standard'
}

LARGE_ENGINES = {
    'fortuner', 'innova', 'land cruiser', 'camry', 'accord', 'civic', 
    'cr-v', 'elantra', 'pajero'
}
MEDIUM_ENGINES = {
    'ciaz', 'city', 'verna', 'sx4', 's cross', 'vitara brezza', 
    'creta', 'duster', 'corolla altis', 'etios g', 'xcent', 'amaze'
}

class CarFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom Scikit-Learn Transformer for engineering domain-specific features
    from the raw Car Price Prediction dataset.
    """
    def __init__(self, current_year=2026):
        self.current_year = current_year

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        # Prevent warning/modification on reference copy
        df = X.copy()
        
        # 1. Car Age
        df['Car_Age'] = self.current_year - df['Year']
        
        # 2. Brand Extraction
        df['Brand'] = df['Car_Name'].str.lower().map(BRAND_MAPPING).fillna('Others')
        
        # 3. Brand Reputation
        df['Brand_Reputation'] = df['Brand'].map(REPUTATION_MAPPING).fillna('Standard')
        
        # 4. Mileage Category (based on Kms_Driven)
        df['Mileage_Category'] = pd.cut(
            df['Kms_Driven'],
            bins=[-1, 30000, 80000, np.inf],
            labels=['Low', 'Medium', 'High']
        ).astype(str)
        
        # 5. Engine & Horsepower Categories
        df['Engine_Category'] = df['Car_Name'].str.lower().apply(
            lambda x: 'Large' if x in LARGE_ENGINES else ('Medium' if x in MEDIUM_ENGINES else 'Small')
        )
        df['Horsepower_Category'] = df['Car_Name'].str.lower().apply(
            lambda x: 'High' if x in LARGE_ENGINES else ('Medium' if x in MEDIUM_ENGINES else 'Low')
        )
        
        # 6. Luxury Segment (based on Present_Price)
        df['Luxury_Segment'] = pd.cut(
            df['Present_Price'],
            bins=[-1, 5.0, 15.0, np.inf],
            labels=['Budget', 'Mid-Range', 'Premium']
        ).astype(str)
        
        # 7. Owner Category
        df['Owner_Category'] = df['Owner'].apply(
            lambda x: 'First Owner' if x == 0 else ('Second Owner' if x == 1 else 'Multiple Owners')
        )
        
        return df

def get_preprocessing_pipeline():
    """
    Returns the complete preprocessing pipeline including feature engineering,
    one-hot encoding, and scaling.
    """
    engineered_cols = [
        'Car_Age', 'Present_Price', 'Kms_Driven', 'Brand', 'Brand_Reputation',
        'Mileage_Category', 'Engine_Category', 'Horsepower_Category', 
        'Luxury_Segment', 'Owner_Category', 'Fuel_Type', 'Seller_Type', 'Transmission'
    ]
    
    categorical_cols = [
        'Brand', 'Brand_Reputation', 'Mileage_Category', 'Engine_Category', 
        'Horsepower_Category', 'Luxury_Segment', 'Owner_Category', 
        'Fuel_Type', 'Seller_Type', 'Transmission'
    ]
    
    numerical_cols = ['Car_Age', 'Present_Price', 'Kms_Driven']
    
    # Transformer for preprocessing numerical and categorical features
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
        ],
        remainder='drop'
    )
    
    # Full pipeline combining feature engineering and preprocessing
    full_pipeline = Pipeline(steps=[
        ('engineer', CarFeatureEngineer()),
        ('preprocessor', preprocessor)
    ])
    
    return full_pipeline

def clean_raw_data(df):
    """
    Cleans raw dataset by handling duplicates and verifying data integrity.
    """
    # 1. Remove duplicates
    df_cleaned = df.drop_duplicates().copy()
    
    # 2. Check for missing values (if any, impute or drop)
    df_cleaned = df_cleaned.dropna()
    
    # 3. Ensure proper data types
    df_cleaned['Year'] = df_cleaned['Year'].astype(int)
    df_cleaned['Kms_Driven'] = df_cleaned['Kms_Driven'].astype(int)
    df_cleaned['Selling_Price'] = df_cleaned['Selling_Price'].astype(float)
    df_cleaned['Present_Price'] = df_cleaned['Present_Price'].astype(float)
    df_cleaned['Owner'] = df_cleaned['Owner'].astype(int)
    
    return df_cleaned
