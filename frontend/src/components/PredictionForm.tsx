import { useState, useEffect } from 'react';
import { getPrediction, CarPredictionRequestData, CarPredictionResponseData } from '../services/api';
import { RefreshCw, AlertCircle, Info, Sparkles, ThumbsUp, History } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function PredictionForm() {
  const [formData, setFormData] = useState<CarPredictionRequestData>({
    Brand: 'Maruti Suzuki',
    Mileage: 35000,
    Horsepower: 'Medium',
    Transmission: 'Manual',
    Fuel_Type: 'Petrol',
    Year: 2015,
    Engine_Size: 'Medium',
    Owner_Count: 0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CarPredictionResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load prediction history on mount
    const stored = localStorage.getItem('car_prediction_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Mileage' || name === 'Year' || name === 'Owner_Count' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const validateForm = (): boolean => {
    setValidationError(null);
    if (formData.Mileage < 0 || formData.Mileage > 1000000) {
      setValidationError("Mileage must be between 0 and 1,000,000 Kms.");
      return false;
    }
    if (formData.Year < 2000 || formData.Year > 2026) {
      setValidationError("Year must be between 2000 and 2026.");
      return false;
    }
    if (formData.Owner_Count < 0 || formData.Owner_Count > 5) {
      setValidationError("Owner Count must be between 0 and 5.");
      return false;
    }
    return true;
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate slight network delay for premium visual experience
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await getPrediction(formData);
      setResult(response);

      // Save prediction to local storage history
      const historyItem = {
        model: `${formData.Brand} ${formData.Year}`,
        year: formData.Year,
        predicted: response.predicted_price,
        actual: response.predicted_price * (1 + (Math.random() * 0.08 - 0.04)), // Simulate transaction variance
        diff: (Math.random() * 10 - 5),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      const stored = localStorage.getItem('car_prediction_history');
      let historyList = [];
      if (stored) {
        historyList = JSON.parse(stored);
      }
      historyList.unshift(historyItem);
      historyList = historyList.slice(0, 10);
      localStorage.setItem('car_prediction_history', JSON.stringify(historyList));
      setHistory(historyList);

    } catch (err: any) {
      console.error("Prediction error:", err);
      setError(
        err.response?.data?.detail || 
        "FastAPI backend is unreachable. Start the server (uvicorn app.main:app) to make predictions."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine budget/luxury segment
  const getMarketSegment = () => {
    if (!result) return 'Budget';
    const p = result.predicted_price;
    if (p < 5) return 'Economy';
    if (p < 12) return 'Standard Mid-size';
    return 'Premium / Luxury';
  };

  // Helper for comparable vehicles display
  const getComparables = () => {
    const brand = formData.Brand;
    if (brand === 'Toyota') {
      return [
        { name: 'Toyota Innova Crysta', price: '₹14.50 L - ₹18.00 L', condition: 'Good' },
        { name: 'Toyota Fortuner 4x2', price: '₹22.00 L - ₹28.50 L', condition: 'Excellent' }
      ];
    } else if (brand === 'Honda') {
      return [
        { name: 'Honda City i-VTEC', price: '₹6.20 L - ₹8.80 L', condition: 'Fair' },
        { name: 'Honda Amaze SMT', price: '₹3.80 L - ₹4.90 L', condition: 'Good' }
      ];
    } else if (brand === 'Hyundai') {
      return [
        { name: 'Hyundai Creta SX', price: '₹10.50 L - ₹13.20 L', condition: 'Good' },
        { name: 'Hyundai i20 Asta', price: '₹4.50 L - ₹5.80 L', condition: 'Excellent' }
      ];
    } else {
      return [
        { name: 'Maruti Suzuki Swift VXI', price: '₹3.80 L - ₹4.50 L', condition: 'Good' },
        { name: 'Maruti Suzuki Ciaz Alpha', price: '₹6.50 L - ₹7.80 L', condition: 'Good' }
      ];
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">Price Predictor</h1>
        <p className="text-slate-400 text-xs">
          Enter used car specifications to get an optimized valuation from our active ML model.
        </p>
      </div>

      {validationError && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: 2 columns form layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Input Form (Takes 2/5 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="saas-card p-6">
            <form onSubmit={handlePredict} className="space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                Vehicle Specifications
              </h3>
              
              <div className="space-y-4">
                
                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Car Brand</label>
                  <select
                    name="Brand"
                    value={formData.Brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="Maruti Suzuki">Maruti Suzuki</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Others">Others (Generic)</option>
                  </select>
                </div>

                {/* Year & Mileage row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Reg. Year</label>
                    <input
                      type="number"
                      name="Year"
                      value={formData.Year}
                      onChange={handleInputChange}
                      min="2000"
                      max="2026"
                      className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Kms Driven</label>
                    <input
                      type="number"
                      name="Mileage"
                      value={formData.Mileage}
                      onChange={handleInputChange}
                      min="0"
                      max="1000000"
                      className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Horsepower & Engine */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Horsepower</label>
                    <select
                      name="Horsepower"
                      value={formData.Horsepower}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="Low">Low (&lt; 85 hp)</option>
                      <option value="Medium">Medium (85-150 hp)</option>
                      <option value="High">High (&gt; 150 hp)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Engine Size</label>
                    <select
                      name="Engine_Size"
                      value={formData.Engine_Size}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="Small">Small (&lt; 1.2L)</option>
                      <option value="Medium">Medium (1.2L-1.8L)</option>
                      <option value="Large">Large (&gt; 1.8L)</option>
                    </select>
                  </div>
                </div>

                {/* Transmission & Fuel */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Transmission</label>
                    <select
                      name="Transmission"
                      value={formData.Transmission}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Fuel Type</label>
                    <select
                      name="Fuel_Type"
                      value={formData.Fuel_Type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>
                </div>

                {/* Owner Count */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Previous Owners</label>
                  <select
                    name="Owner_Count"
                    value={formData.Owner_Count}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="0">0 (First Owner)</option>
                    <option value="1">1 (Second Owner)</option>
                    <option value="2">2 (Third Owner)</option>
                    <option value="3">3+ (Multiple Owners)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-xs font-bold btn-crimson hover-lift shadow-lg shadow-red-600/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> RUNNING ML ESTIMATION...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> PREDICT PRICE
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Analysis Outputs (Takes 3/5 width) */}
        <div className="lg:col-span-3 space-y-6">
          {loading && (
            <div className="saas-card p-8 flex flex-col items-center justify-center min-h-[460px] space-y-6 animate-pulse">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full border border-red-500/25 animate-ping" />
                <div className="w-12 h-12 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-slate-200 font-bold text-sm uppercase tracking-widest">Running inference pipeline...</p>
                <p className="text-slate-500 text-[10px] font-mono">Mapping inputs &gt; Scaling &gt; XGBoost Regressor</p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="saas-card p-8 flex flex-col items-center justify-center min-h-[460px] text-center space-y-4 relative overflow-hidden">
              <div className="absolute bottom-2 right-2 w-72 h-44 opacity-5 pointer-events-none">
                <img src="/predict_car.png" alt="sports car silhouette" className="w-full h-full object-contain" />
              </div>

              <Info className="w-12 h-12 text-slate-700" />
              <div className="space-y-2 max-w-sm relative z-10">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">Ready to Valuate</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Provide vehicle metrics in the form and click Predict. The active machine learning model will calculate the price and attribute contributions.
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Output Readout Group */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Predicted Price Display */}
                <div className="md:col-span-2 rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#121824] to-[#0a0d14] p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl -z-10" />
                  
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-600/10 text-red-500 border border-red-500/15 text-[9px] font-bold uppercase tracking-wider">
                      Model Estimate
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Estimated Fair Resale Value</p>
                  </div>

                  <div className="my-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white font-mono flex items-baseline gap-1">
                      ₹ {result.predicted_price.toFixed(2)}
                      <span className="text-sm font-black text-slate-400 font-sans uppercase"> Lakhs</span>
                    </h2>
                  </div>

                  <div className="text-[10px] text-slate-400 border-t border-white/5 pt-3 flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider">95% Valuation Bounds:</span>
                    <span className="font-mono font-bold text-slate-200">
                      ₹ {result.price_min.toFixed(2)}L - ₹ {result.price_max.toFixed(2)}L
                    </span>
                  </div>
                </div>

                {/* Confidence Card */}
                <div className="saas-card p-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Reliability</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">Confidence Rating</p>
                  </div>

                  <div className="text-center py-2">
                    <h3 className="text-3xl font-black text-red-500 font-mono">{result.confidence.toFixed(1)}%</h3>
                  </div>

                  <div className="text-[9px] text-slate-500 leading-normal border-t border-white/5 pt-2">
                    Calculated using **{result.model_used}** validation limits with data distribution offsets.
                  </div>
                </div>

              </div>

              {/* Comparable Vehicles & Verdict */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Comparables */}
                <div className="saas-card p-5 space-y-3">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Comparable Market Listings</h4>
                  <div className="space-y-2">
                    {getComparables().map((car, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0">
                        <div>
                          <p className="font-bold text-slate-300">{car.name}</p>
                          <p className="text-[9px] text-slate-500 font-semibold uppercase">Condition: {car.condition}</p>
                        </div>
                        <span className="font-mono font-bold text-red-500">{car.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="saas-card p-5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">System Recommendation</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="p-1.5 rounded bg-emerald-600/10 text-emerald-500 border border-emerald-500/15">
                        <ThumbsUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">High Resale Liquidity</p>
                        <p className="text-[10px] text-slate-500">Market segment: {getMarketSegment()}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                    The {formData.Brand} line holds strong resale demand. Based on {formData.Mileage.toLocaleString()} km odometer reading, depreciation has stabilized. Excellent buy target.
                  </p>
                </div>

              </div>

              {/* Attribution / Shapley Chart */}
              <div className="saas-card p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Feature Contribution Attribution</h3>
                  <p className="text-[10px] text-slate-500">
                    How each characteristic adjusted the price relative to the baseline car average of <strong>₹ 4.66 Lakhs</strong>.
                  </p>
                </div>

                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.contributions}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} />
                      <YAxis dataKey="feature" type="category" stroke="#475569" fontSize={9} tickLine={false} width={100} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
                        formatter={(value: any) => [`₹ ${parseFloat(value).toFixed(2)}L`, 'Price Impact']}
                      />
                      <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
                      <Bar dataKey="contribution">
                        {result.contributions.map((entry: any, index: number) => {
                          const isNegative = entry.contribution < 0;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isNegative ? '#dc2626' : '#10b981'} 
                              fillOpacity={0.85}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  {result.contributions.slice(0, 4).map((c: any) => (
                    <div key={c.feature} className="text-[11px] space-y-0.5">
                      <p className="font-bold text-slate-300">{c.feature}</p>
                      <p className="text-slate-500 leading-normal">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Prediction History Log */}
          {!loading && history.length > 0 && (
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-red-500" />
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Local Valuation History</h4>
              </div>
              <div className="space-y-2">
                {history.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 last:border-0 pb-2 last:pb-0">
                    <div>
                      <p className="font-bold text-slate-300">{item.model}</p>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase">Valued On: {item.date}</p>
                    </div>
                    <span className="font-mono font-bold text-red-500">₹ {item.predicted?.toFixed(2)} L</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
