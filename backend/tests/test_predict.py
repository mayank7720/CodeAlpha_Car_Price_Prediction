import os
import sys
from fastapi.testclient import TestClient

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Car Price Prediction API" in response.text

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_model_info():
    response = client.get("/api/v1/predict/model-info")
    assert response.status_code == 200
    assert "Car Price Prediction" in response.json() or "Linear Regression" in response.json()

def test_prediction_valid():
    payload = {
        "Brand": "Toyota",
        "Mileage": 45000,
        "Horsepower": "High",
        "Transmission": "Automatic",
        "Fuel_Type": "Diesel",
        "Year": 2016,
        "Engine_Size": "Large",
        "Owner_Count": 0
    }
    response = client.post("/api/v1/predict/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_price" in data
    assert data["predicted_price"] > 0
    assert "confidence" in data
    assert "price_min" in data
    assert "price_max" in data
    assert len(data["contributions"]) == 6

def test_prediction_invalid_year():
    payload = {
        "Brand": "Toyota",
        "Mileage": 45000,
        "Horsepower": "High",
        "Transmission": "Automatic",
        "Fuel_Type": "Diesel",
        "Year": 1899,  # Invalid year boundary (ge=1900)
        "Engine_Size": "Large",
        "Owner_Count": 0
    }
    response = client.post("/api/v1/predict/", json=payload)
    assert response.status_code == 422  # Validation Error

def test_prediction_invalid_mileage():
    payload = {
        "Brand": "Toyota",
        "Mileage": -100,  # Invalid negative mileage
        "Horsepower": "High",
        "Transmission": "Automatic",
        "Fuel_Type": "Diesel",
        "Year": 2018,
        "Engine_Size": "Large",
        "Owner_Count": 0
    }
    response = client.post("/api/v1/predict/", json=payload)
    assert response.status_code == 422  # Validation Error
