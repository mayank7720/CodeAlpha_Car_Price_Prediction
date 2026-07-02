from pydantic import BaseModel, Field
from typing import List, Dict, Literal

class CarPredictionRequest(BaseModel):
    Brand: Literal["Maruti Suzuki", "Hyundai", "Toyota", "Honda", "Others"] = Field(
        ..., description="The brand of the car"
    )
    Mileage: int = Field(
        ..., ge=0, le=1000000, description="Total kilometers driven by the car"
    )
    Horsepower: Literal["Low", "Medium", "High"] = Field(
        ..., description="Horsepower level (Low, Medium, High)"
    )
    Transmission: Literal["Manual", "Automatic"] = Field(
        ..., description="Transmission type (Manual, Automatic)"
    )
    Fuel_Type: Literal["Petrol", "Diesel", "CNG"] = Field(
        ..., description="Engine fuel type (Petrol, Diesel, CNG)"
    )
    Year: int = Field(
        ..., ge=1900, le=2026, description="Registration year of the car"
    )
    Engine_Size: Literal["Small", "Medium", "Large"] = Field(
        ..., description="Engine displacement class (Small, Medium, Large)"
    )
    Owner_Count: int = Field(
        ..., ge=0, le=5, description="Number of previous owners"
    )

class FeatureContribution(BaseModel):
    feature: str
    contribution: float
    description: str

class CarPredictionResponse(BaseModel):
    predicted_price: float = Field(..., description="Estimated price in Lakhs")
    confidence: float = Field(..., description="Confidence percentage of the prediction")
    price_min: float = Field(..., description="Minimum estimated boundary price")
    price_max: float = Field(..., description="Maximum estimated boundary price")
    model_used: str = Field(..., description="Active ML model name used for prediction")
    contributions: List[FeatureContribution] = Field(
        ..., description="Attribution / Shapley-like feature contributions"
    )
    timestamp: str
