import { useState } from 'react';
import { getPrediction, CarPredictionRequestData } from '../services/api';
import { RefreshCw, GitCompare, AlertCircle } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompareCars() {
  const [carA, setCarA] = useState<CarPredictionRequestData>({
    Brand: 'Toyota',
    Mileage: 30000,
    Horsepower: 'High',
    Transmission: 'Automatic',
    Fuel_Type: 'Diesel',
    Year: 2018,
    Engine_Size: 'Large',
    Owner_Count: 0
  });

  const [carB, setCarB] = useState<CarPredictionRequestData>({
    Brand: 'Maruti Suzuki',
    Mileage: 60000,
    Horsepower: 'Low',
    Transmission: 'Manual',
    Fuel_Type: 'Petrol',
    Year: 2014,
    Engine_Size: 'Small',
    Owner_Count: 1
  });

  const [loading, setLoading] = useState(false);
  const [resultA, setResultA] = useState<any>(null);
  const [resultB, setResultB] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (car: 'A' | 'B', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updateFn = car === 'A' ? setCarA : setCarB;
    updateFn(prev => ({
      ...prev,
      [name]: name === 'Mileage' || name === 'Year' || name === 'Owner_Count' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultA(null);
    setResultB(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const [resA, resB] = await Promise.all([
        getPrediction(carA),
        getPrediction(carB)
      ]);
      setResultA(resA);
      setResultB(resB);
    } catch (err: any) {
      console.error("Comparison prediction error:", err);
      setError("FastAPI server connection error. Start backend to execute compare predictions.");
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!resultA || !resultB) return [];
    return [
      { name: `${carA.Brand} (A)`, price: resultA.predicted_price, fill: '#dc2626' },
      { name: `${carB.Brand} (B)`, price: resultB.predicted_price, fill: '#475569' }
    ];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">Compare Vehicles</h1>
        <p className="text-slate-400 text-xs">
          Evaluate and contrast price valuations for two different vehicle configurations side-by-side.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCompare} className="space-y-6">
        
        {/* Forms Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Car A Form Pane */}
          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-500 border-b border-white/5 pb-2">
              Vehicle A Specifications
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Brand</label>
                  <select
                    name="Brand"
                    value={carA.Brand}
                    onChange={(e) => handleInputChange('A', e)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="Maruti Suzuki">Maruti Suzuki</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Reg. Year</label>
                  <input
                    type="number"
                    name="Year"
                    value={carA.Year}
                    onChange={(e) => handleInputChange('A', e)}
                    min="2000"
                    max="2026"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Mileage (Km)</label>
                  <input
                    type="number"
                    name="Mileage"
                    value={carA.Mileage}
                    onChange={(e) => handleInputChange('A', e)}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Transmission</label>
                  <select
                    name="Transmission"
                    value={carA.Transmission}
                    onChange={(e) => handleInputChange('A', e)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Fuel Type</label>
                  <select
                    name="Fuel_Type"
                    value={carA.Fuel_Type}
                    onChange={(e) => handleInputChange('A', e)}
                    className="w-full px-2 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Engine Size</label>
                  <select
                    name="Engine_Size"
                    value={carA.Engine_Size}
                    onChange={(e) => handleInputChange('A', e)}
                    className="w-full px-2 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">HP</label>
                  <select
                    name="Horsepower"
                    value={carA.Horsepower}
                    onChange={(e) => handleInputChange('A', e)}
                    className="w-full px-2 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Car B Form Pane */}
          <div className="saas-card p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
              Vehicle B Specifications
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Brand</label>
                  <select
                    name="Brand"
                    value={carB.Brand}
                    onChange={(e) => handleInputChange('B', e)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="Maruti Suzuki">Maruti Suzuki</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Reg. Year</label>
                  <input
                    type="number"
                    name="Year"
                    value={carB.Year}
                    onChange={(e) => handleInputChange('B', e)}
                    min="2000"
                    max="2026"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Mileage (Km)</label>
                  <input
                    type="number"
                    name="Mileage"
                    value={carB.Mileage}
                    onChange={(e) => handleInputChange('B', e)}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Transmission</label>
                  <select
                    name="Transmission"
                    value={carB.Transmission}
                    onChange={(e) => handleInputChange('B', e)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Fuel Type</label>
                  <select
                    name="Fuel_Type"
                    value={carB.Fuel_Type}
                    onChange={(e) => handleInputChange('B', e)}
                    className="w-full px-2 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Engine Size</label>
                  <select
                    name="Engine_Size"
                    value={carB.Engine_Size}
                    onChange={(e) => handleInputChange('B', e)}
                    className="w-full px-2 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">HP</label>
                  <select
                    name="Horsepower"
                    value={carB.Horsepower}
                    onChange={(e) => handleInputChange('B', e)}
                    className="w-full px-2 py-2 rounded-lg bg-[#0d111a] border border-white/5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg text-xs font-bold btn-crimson hover-lift shadow-lg shadow-red-600/10 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> COMPARATIVE INFERENCE RUNNING...
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" /> RUN COMPARISON
            </>
          )}
        </button>
      </form>

      {/* Output Results comparison */}
      {!loading && resultA && resultB && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price compare cards */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#121824] to-[#0a0d14] p-6 flex flex-col justify-between shadow-2xl min-h-[160px]">
              <div>
                <span className="px-2 py-0.5 rounded bg-red-600/10 text-red-500 border border-red-500/15 text-[9px] font-bold uppercase">
                  Vehicle A Valuation
                </span>
                <h4 className="text-sm font-bold text-slate-200 mt-2">{carA.Brand} ({carA.Year})</h4>
              </div>
              <h2 className="text-3xl font-black text-white font-mono mt-4">
                ₹ {resultA.predicted_price.toFixed(2)} <span className="text-xs text-slate-400 font-sans uppercase">Lakhs</span>
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1b2332] to-[#121824] p-6 flex flex-col justify-between shadow-2xl min-h-[160px]">
              <div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 text-[9px] font-bold uppercase">
                  Vehicle B Valuation
                </span>
                <h4 className="text-sm font-bold text-slate-200 mt-2">{carB.Brand} ({carB.Year})</h4>
              </div>
              <h2 className="text-3xl font-black text-white font-mono mt-4">
                ₹ {resultB.predicted_price.toFixed(2)} <span className="text-xs text-slate-400 font-sans uppercase">Lakhs</span>
              </h2>
            </div>
          </div>

          {/* Comparative graph */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Price Offset Bar Chart */}
            <div className="saas-card p-5 space-y-4 lg:col-span-2">
              <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Valuation Comparison</h4>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} formatter={(val) => `₹ ${val}L`} />
                    <Bar dataKey="price" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {getChartData().map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Verdict */}
            <div className="saas-card p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Valuation Offset</h4>
                <div className="pt-2">
                  <p className="text-xs text-slate-400">
                    The price difference between the two vehicle configurations is:
                  </p>
                  <h3 className="text-2xl font-black text-red-500 font-mono mt-1">
                    ₹ {Math.abs(resultA.predicted_price - resultB.predicted_price).toFixed(2)} L
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
                    {resultA.predicted_price > resultB.predicted_price ? 'Car A' : 'Car B'} holds a premium value
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] text-red-400 leading-relaxed mt-4">
                <strong>Verdict:</strong> {resultA.predicted_price > resultB.predicted_price 
                  ? `${carA.Brand} (${carA.Year}) commands a higher resale due to segment luxury thresholds, automatic gears, or diesel fuel classes.` 
                  : `${carB.Brand} (${carB.Year}) yields higher resale commanded by lower mileage or a more recent registration year.`
                }
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
