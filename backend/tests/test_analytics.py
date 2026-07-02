import os
import sys
from fastapi.testclient import TestClient

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_dataset_overview():
    response = client.get("/api/v1/analytics/dataset-overview")
    assert response.status_code == 200
    data = response.json()
    assert "shape" in data
    assert data["shape"] == [301, 9]  # Raw dataset dimensions
    assert "columns" in data
    assert len(data["columns"]) == 9
    assert "data_types" in data
    assert "missing_values" in data
    assert "duplicate_rows" in data
    assert data["duplicate_rows"] == 2
    assert "sample_data" in data

def test_eda_charts():
    response = client.get("/api/v1/analytics/eda")
    assert response.status_code == 200
    data = response.json()
    assert "price_distribution" in data
    assert "brand_distribution" in data
    assert "fuel_distribution" in data
    assert "transmission_distribution" in data
    assert "mileage_distribution" in data
    assert "correlation" in data
    assert "scatter" in data
    assert "box_plot" in data
    
    # Verify Slope Skill trendline values are computed
    assert "depreciation_slope" in data["scatter"]
    assert "trendline" in data["scatter"]
    assert len(data["scatter"]["trendline"]) == 2

def test_feature_importance():
    response = client.get("/api/v1/analytics/feature-importance")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 15
    for item in data:
        assert "feature" in item
        assert "permutation_importance" in item
        assert "native_importance" in item
        assert "explanation" in item

def test_widgets():
    response = client.get("/api/v1/analytics/widgets")
    assert response.status_code == 200
    data = response.json()
    assert "dataset_size" in data
    assert data["dataset_size"] == 301
    assert "average_price" in data
    assert "most_expensive_brand" in data
    assert "least_expensive_brand" in data
    assert "average_horsepower" in data
    assert "average_mileage" in data
    assert "model_accuracy" in data
