import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from app.api.v1.endpoints import predict, analytics

# Initialize FastAPI App
app = FastAPI(
    title="Car Price Prediction API",
    description="Production-ready FastAPI backend for estimating used car resale values and serving dataset exploratory analytics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware (allows React client on port 5173 to execute requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local testing, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount Endpoint Routers
app.include_router(predict.router, prefix="/api/v1/predict", tags=["prediction"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/", response_class=HTMLResponse, tags=["system"])
def root():
    """
    Welcome index page mapping documentation routes.
    """
    return """
    <html>
        <head>
            <title>Car Price Prediction API</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #0b0f19;
                    color: #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background-color: rgba(21, 28, 44, 0.75);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(12px);
                    max-width: 600px;
                    text-align: center;
                }
                h1 {
                    color: #3b82f6;
                    margin-bottom: 20px;
                }
                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #3b82f6;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    transition: background-color 0.2s;
                }
                a:hover {
                    background-color: #2563eb;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Car Price Prediction API</h1>
                <p>Welcome! The FastAPI backend is running successfully and serving machine learning predictions.</p>
                <p>To inspect endpoints and execute live API requests, visit the Swagger documentation.</p>
                <a href="/docs">View API Docs (Swagger)</a>
            </div>
        </body>
    </html>
    """

@app.get("/health", tags=["system"])
def health_check():
    """
    Health check endpoint for container/orchestrator monitoring.
    """
    return {
        "status": "healthy",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
