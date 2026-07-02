from fastapi import APIRouter, HTTPException, status
from app.models.schemas import CarPredictionRequest, CarPredictionResponse
from app.services.prediction import PredictionService

router = APIRouter()
prediction_service = PredictionService()

@router.post("/", response_model=CarPredictionResponse, summary="Predict Car Resale Price")
def predict_car_price(request: CarPredictionRequest):
    """
    Submits user characteristics to perform ML prediction and returns:
    - predicted_price: estimate in Lakhs
    - confidence: estimation confidence percentage
    - price_min/price_max: 95% price range
    - contributions: Shapley-like relative feature attribution list
    """
    try:
        result = prediction_service.predict_price(request)
        return result
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(re)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}"
        )

@router.get("/model-info", summary="Retrieve Trained Model Info")
def get_model_info():
    """
    Returns comparative cross-validation performance details and metrics
    about the active ML regressor.
    """
    try:
        info = prediction_service.get_model_info()
        return info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not load model info: {str(e)}"
        )
