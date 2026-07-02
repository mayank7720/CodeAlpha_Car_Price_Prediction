# Car Price Prediction Dashboard

A production-ready machine learning project designed to predict car prices using historical dataset metrics and interactive dashboards.

## 🚀 Live Deployments

- **Production SaaS Dashboard (React + Vercel)**: [Live Web App](https://code-alpha-car-price-prediction.vercel.app)
- **Interactive Data App (Streamlit Cloud)**: [Streamlit Live App](https://codealphacarpriceprediction-ett6m77r5zvh6oh6qrp3bm.streamlit.app)
- **FastAPI ML Backend (Render)**: [API Documentation (Swagger)](https://YOUR-RENDER-URL.onrender.com/docs)

*Note: If your hosted subdomains on Vercel, Streamlit, or Render are named differently, feel free to update these links in the file.*

## Project Architecture & Tech Stack

This project is divided into two primary parts: a FastAPI backend serving ML model predictions and analytics, and a React + TypeScript frontend utilizing Tailwind CSS and interactive plotting libraries.

### Technology Stack:
- **Backend**: Python, FastAPI, Scikit-learn, XGBoost, Pandas, NumPy, Joblib (model serialization), Uvicorn.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Heroicons, Recharts, Axios.
- **Machine Learning**: 
  - An 8-model comparison pipeline (Linear, Ridge, Lasso, Decision Tree, Random Forest, Gradient Boosting, Extra Trees, XGBoost) combined with `GridSearchCV` for hyperparameter tuning.
  - The final selected model is **XGBoost** (achieving the highest $R^2$ of ~0.88).
- **Design Philosophy**: High-fidelity UX patterns using **UI-UX-Pro-Max** guidelines (dark theme, glassmorphism, responsive cards, interactive micro-animations) and advanced data visualization with **Slope Skill** (trendline visualizers, data-driven inferences).

---

## Folder Structure

```text
Car Price Prediction/
├── backend/                  # FastAPI Application and ML Pipelines
│   ├── app/
│   │   ├── main.py           # Application entry point
│   │   ├── api/              # API endpoints (v1)
│   │   │   └── v1/endpoints/
│   │   │       ├── predict.py     # Inference endpoint
│   │   │       └── analytics.py   # Analytics & visualizations
│   │   ├── models/           # Pydantic schemas (Request/Response validation)
│   │   │   └── schemas.py
│   │   └── services/         # Machine learning inference & analysis logic
│   │       ├── prediction.py # Model loader and prediction service
│   │       ├── preprocessing.py # Custom Transformers
│   │       └── training.py   # Model training logic
│   ├── run_preprocessing.py  # Script to clean & preprocess dataset
│   ├── run_training.py       # Script to train and evaluate 8 ML models
│   └── tests/                # Pytest suite
│       ├── test_predict.py
│       └── test_analytics.py
│
├── frontend/                 # React + TypeScript + Vite + Tailwind Client
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── App.tsx           # App shell with routing and dashboards
│   │   ├── index.css         # Styling, glassmorphic styles, Tailwind directives
│   │   ├── pages/            # Page components (Home, EDA, Dashboard, etc.)
│   │   ├── services/         # Axios API integration
│   │   └── components/       # Reusable UI components
│   └── package.json          # Node dependencies
│
├── dataset/                  # Machine Learning Datasets
│   ├── raw/                  # Original raw files
│   └── processed/            # Preprocessed datasets
│
├── saved_model/              # Serialized artifacts
│   ├── xgboost_model.joblib  # Trained Scikit-learn/XGBoost estimator
│   ├── preprocessor.joblib   # Preprocessing pipeline
│   ├── model_metrics.json    # Performance indicators (R2, RMSE, MAE)
│   └── feature_importance.json # Permutation importance for model interpretability
│
├── requirements.txt          # Python virtual environment dependencies
└── README.md                 # Project outline and developer guide
```

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
1. Navigate to the root directory and set up a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. (Optional) Run the Preprocessing and Training pipelines if you want to rebuild the model:
   ```bash
   python backend/run_preprocessing.py
   python backend/run_training.py
   ```
4. Start the FastAPI server (from the root directory):
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
   The API documentation will be available at `http://127.0.0.1:8000/docs`.

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## Running Tests
Tests cover all FastAPI routes including inference and analytics.
```bash
pytest backend/tests/ -v
```

## Features
- **Exploratory Data Analysis**: Deep insights via beautiful, glassmorphic charts.
- **Model Performance Metrics**: Compare performance across 8 regression models.
- **Feature Contributions**: Explanations for how each feature shifts the predicted vehicle price.
- **Live Prediction**: Interactive form validating user input with Pydantic schemas and returning real-time predictions with confidence scores.
