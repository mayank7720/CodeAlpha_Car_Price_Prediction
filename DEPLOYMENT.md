# Deployment Guide - Production SaaS Car Price Prediction

This guide provides instructions to deploy your high-fidelity SaaS React dashboard and FastAPI machine learning backend to the web for free.

---

## 1. Deploy the FastAPI Backend (Render)

Render is a free developer-friendly cloud hosting platform for Python services.

### Steps:
1. Sign up for a free account at **[render.com](https://render.com/)**.
2. Connect your GitHub account and click **New > Web Service**.
3. Select your repository `mayank7720/CodeAlpha_Car_Price_Prediction`.
4. Configure the Web Service settings:
   - **Name**: `car-price-api` (or any name you prefer)
   - **Root Directory**: `.` (leave blank)
   - **Language**: `Python 3` (or `Docker` if you prefer container builds)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
5. Click **Deploy Web Service**.
6. Once deployed, Render will provide you with a live URL (e.g. `https://car-price-api.onrender.com`). **Copy this URL** (this will be your backend endpoint).

---

## 2. Deploy the React Frontend (Vercel)

Vercel is the industry-standard hosting platform for React and Vite static applications.

### Steps:
1. Sign up for a free account at **[vercel.com](https://vercel.com/)**.
2. Click **Add New > Project** and import your repository `mayank7720/CodeAlpha_Car_Price_Prediction`.
3. Configure the Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Click **Edit** and choose the `frontend` folder)
4. Open the **Environment Variables** dropdown and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://car-price-api.onrender.com/api/v1` *(Replace with your actual live Render backend URL, making sure to append `/api/v1` to the end!)*
5. Click **Deploy**.
6. Vercel will build and host your premium sports car dashboard at a live address (e.g. `https://codealpha-car-price-prediction.vercel.app`).

---

## Technical Features Configured for Production:
- **Dynamic API Base URL**: The React code in `frontend/src/services/api.ts` is configured to look for the environment variable `VITE_API_URL` when built on Vercel, and falls back to local host port `8000` during local development automatically.
- **Permissive CORS Settings**: The FastAPI backend (`backend/app/main.py`) CORSMiddleware allows any origin (`allow_origins=["*"]`), ensuring Vercel requests are not blocked by browser CORS restrictions.
