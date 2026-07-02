import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CarPredictionRequestData {
  Brand: string;
  Mileage: number;
  Horsepower: string;
  Transmission: string;
  Fuel_Type: string;
  Year: number;
  Engine_Size: string;
  Owner_Count: number;
}

export interface FeatureContributionData {
  feature: string;
  contribution: number;
  description: string;
}

export interface CarPredictionResponseData {
  predicted_price: number;
  confidence: number;
  price_min: number;
  price_max: number;
  model_used: string;
  contributions: FeatureContributionData[];
  timestamp: string;
}

export const getDatasetOverview = async () => {
  const response = await api.get('/analytics/dataset-overview');
  return response.data;
};

export const getEdaPlots = async () => {
  const response = await api.get('/analytics/eda');
  return response.data;
};

export const getModelComparison = async () => {
  const response = await api.get('/predict/model-info');
  return response.data;
};

export const getFeatureImportance = async () => {
  const response = await api.get('/analytics/feature-importance');
  return response.data;
};

export const getWidgetsData = async () => {
  const response = await api.get('/analytics/widgets');
  return response.data;
};

export const getPrediction = async (data: CarPredictionRequestData): Promise<CarPredictionResponseData> => {
  const response = await api.post('/predict/', data);
  return response.data;
};

export default api;
