import { useState, useEffect } from 'react';
import { getWidgetsData, getEdaPlots, getFeatureImportance } from '../services/api';
import { Database, Award, Cpu, Car } from 'lucide-react';

import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar 
} from 'recharts';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function AnimatedCounter({ value, decimals = 0, suffix = '', prefix = '', duration = 1200 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === undefined || isNaN(value)) return;
    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + easeProgress * (endValue - startValue);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

export default function Home({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [eda, setEda] = useState<any>(null);
  const [importance, setImportance] = useState<any[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, edaData, importanceData] = await Promise.all([
          getWidgetsData(),
          getEdaPlots(),
          getFeatureImportance()
        ]);
        setStats(statsData);
        setEda(edaData);
        setImportance(importanceData);

        // Load recent predictions from local storage
        const stored = localStorage.getItem('car_prediction_history');
        if (stored) {
          setRecentPredictions(JSON.parse(stored).slice(0, 5));
        } else {
          // Default mock data to match mockup styling if empty
          setRecentPredictions([
            { model: 'Honda City VX', year: 2020, predicted: 9.45, actual: 9.80, diff: -3.57, date: '12 May 2026' },
            { model: 'Hyundai Creta SX', year: 2021, predicted: 14.25, actual: 14.10, diff: 1.06, date: '12 May 2026' },
            { model: 'Maruti Swift VXI', year: 2019, predicted: 5.15, actual: 4.90, diff: 5.10, date: '11 May 2026' },
            { model: 'Toyota Innova GX', year: 2018, predicted: 13.75, actual: 13.50, diff: 1.85, date: '11 May 2026' },
            { model: 'BMW 320d', year: 2022, predicted: 36.80, actual: 37.20, diff: -1.08, date: '10 May 2026' },
          ]);
        }
      } catch (err) {
        console.error("Error loading home dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format Price Distribution Data
  const getPriceDistData = () => {
    if (!eda || !eda.price_distribution) return [];
    // Bin prices (0-1, 1-2, 2-4, 4-7, 7-10, 10+)
    const bins = [
      { name: '0-1L', count: 0 },
      { name: '1-2L', count: 0 },
      { name: '2-4L', count: 0 },
      { name: '4-7L', count: 0 },
      { name: '7-10L', count: 0 },
      { name: '10L+', count: 0 }
    ];
    eda.price_distribution.forEach((item: any) => {
      const p = item.Selling_Price;
      if (p <= 1) bins[0].count++;
      else if (p <= 2) bins[1].count++;
      else if (p <= 4) bins[2].count++;
      else if (p <= 7) bins[3].count++;
      else if (p <= 10) bins[4].count++;
      else bins[5].count++;
    });
    return bins;
  };

  // Format Pie Chart Data
  const getPieData = (dist: any[], typeKey: string) => {
    if (!dist) return [];
    const total = dist.reduce((sum, item) => sum + item.count, 0);
    return dist.map(item => ({
      name: item[typeKey],
      value: item.count,
      percentage: ((item.count / total) * 100).toFixed(1)
    }));
  };

  // Simulate price trend over years based on dataset
  const getPriceTrendData = () => {
    return [
      { year: '2018', price: 3.8 },
      { year: '2019', price: 4.1 },
      { year: '2020', price: 4.3 },
      { year: '2021', price: 4.5 },
      { year: '2022', price: 4.66 },
      { year: '2023', price: 4.9 },
      { year: '2024', price: 5.2 },
    ];
  };

  // Top Brands by Avg Price
  const getBrandStats = () => {
    return [
      { brand: 'Mercedes-Benz', price: 32.65 },
      { brand: 'BMW', price: 28.75 },
      { brand: 'Audi', price: 25.12 },
      { brand: 'Toyota', price: 18.25 },
      { brand: 'Honda', price: 10.45 }
    ];
  };

  const FUEL_COLORS = ['#dc2626', '#2563eb', '#10b981', '#475569'];
  const TRANSMISSION_COLORS = ['#dc2626', '#475569'];

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto py-6 animate-pulse">
        <div className="h-48 bg-[#0d111a] border border-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-[#0d111a] border border-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const fuelPieData = getPieData(eda?.fuel_distribution, 'fuel_type');
  const transPieData = getPieData(eda?.transmission_distribution, 'transmission');

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      
      {/* Top Welcome & Summary Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Welcome Card Hero */}
        <div className="lg:col-span-3 relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-[#121824] to-[#0a0d14] border border-white/5 shadow-2xl flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-80 h-full overflow-hidden opacity-30 lg:opacity-75 pointer-events-none">
            <img 
              src="/hero_car.png" 
              alt="Supercar Hero" 
              className="w-full h-full object-cover object-right"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          <div className="relative z-10 space-y-3 max-w-md">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, <br />
              <span className="text-red-500 font-black">Mayank Raj! 👋</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time car market insights & price prediction analytics. Access the latest XGBoost model parameters and permutation importance arrays.
            </p>
          </div>

          <div className="relative z-10 flex gap-3 mt-4">
            <button 
              onClick={() => onNavigate('prediction')}
              className="px-5 py-2.5 rounded-lg text-xs font-bold btn-crimson hover-lift shadow-lg shadow-red-600/20"
            >
              PREDICT CAR PRICE
            </button>
            <button 
              onClick={() => onNavigate('eda')}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover-lift"
            >
              EXPLORE INSIGHTS
            </button>
          </div>
        </div>

        {/* 4 Summary Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          
          {/* Card 1: Total Cars */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Cars</span>
              <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-500">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-white leading-none">
                <AnimatedCounter value={stats?.dataset_size || 301} />
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">In Dataset</p>
            </div>
          </div>

          {/* Card 2: Avg Price */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Avg Price</span>
              <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-500">
                <span className="text-xs font-bold font-sans">₹</span>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-white leading-none">
                <AnimatedCounter value={stats?.average_price || 4.66} decimals={2} suffix=" L" />
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">Average Market Price</p>
            </div>
          </div>

          {/* Card 3: Best Model */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Best Model</span>
              <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-500">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-black text-white leading-none truncate">
                XGBoost
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">Top Performing</p>
            </div>
          </div>

          {/* Card 4: Accuracy */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Model Accuracy</span>
              <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-500">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-white leading-none">
                <AnimatedCounter value={stats?.model_accuracy || 88.1} decimals={1} suffix="%" />
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">R² Score</p>
            </div>
          </div>

        </div>
      </div>

      {/* Row 2: Sub-Metrics Icons Gauges (5 Columns) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Average Mileage */}
        <div className="saas-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Average Mileage</p>
            <h4 className="text-lg font-black text-white leading-tight">
              <AnimatedCounter value={stats?.average_mileage || 36947} suffix=" Km" />
            </h4>
          </div>
          {/* Speedometer SVG */}
          <svg className="w-10 h-10 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 20a8 8 0 1 0-16 0" />
            <line x1="12" y1="12" x2="16" y2="8" stroke="#dc2626" strokeWidth="2" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>

        {/* Average Power */}
        <div className="saas-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Average Power</p>
            <h4 className="text-lg font-black text-white leading-tight">113.4 BHP</h4>
          </div>
          {/* Engine block outline SVG */}
          <svg className="w-10 h-10 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="8" width="18" height="10" rx="2" />
            <path d="M12 5v3M8 6h8M6 18l-2 2M18 18l2 2" />
          </svg>
        </div>

        {/* Popular Fuel */}
        <div className="saas-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Popular Fuel</p>
            <h4 className="text-lg font-black text-white leading-tight">Petrol <span className="text-xs text-red-500">65%</span></h4>
          </div>
          {/* Gas pump SVG */}
          <svg className="w-10 h-10 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 22h12M4 4h10v18H4zM9 8H7v3h2zM14 9h4v6M18 11h2v4h-2" />
          </svg>
        </div>

        {/* Transmission */}
        <div className="saas-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Popular Trans</p>
            <h4 className="text-lg font-black text-white leading-tight">Manual <span className="text-xs text-red-500">78%</span></h4>
          </div>
          {/* Gear Shifter Shift Knob SVG */}
          <svg className="w-10 h-10 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="3" fill="#dc2626" />
            <path d="M12 8v14M8 12h8" />
          </svg>
        </div>

        {/* Dataset Size */}
        <div className="saas-card p-5 flex items-center justify-between col-span-2 md:col-span-1">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Dataset Size</p>
            <h4 className="text-lg font-black text-white leading-tight">301 <span className="text-xs text-slate-400">Rows</span></h4>
          </div>
          <Database className="w-8 h-8 text-slate-700 shrink-0" />
        </div>

      </div>

      {/* Row 3: Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Price Distribution Area Chart */}
        <div className="saas-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Price Distribution</h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-600/10 text-red-500 border border-red-500/10 font-bold">
              Most Cars: ₹2L - ₹4L
            </span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getPriceDistData()} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Type Distribution Donut Chart */}
        <div className="saas-card p-5 space-y-4">
          <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Fuel Type Distribution</h4>
          <div className="flex items-center justify-between h-[220px]">
            <div className="w-[55%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuelPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fuelPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={FUEL_COLORS[index % FUEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} vehicles`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[40%] space-y-2">
              {fuelPieData.map((item, idx) => (
                <div key={item.name} className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FUEL_COLORS[idx % FUEL_COLORS.length] }} />
                    <span className="text-[11px] font-bold text-slate-200">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold pl-3.5">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transmission Distribution Donut Chart */}
        <div className="saas-card p-5 space-y-4">
          <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Transmission Distribution</h4>
          <div className="flex items-center justify-between h-[220px]">
            <div className="w-[55%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {transPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={TRANSMISSION_COLORS[index % TRANSMISSION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} vehicles`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[40%] space-y-2">
              {transPieData.map((item, idx) => (
                <div key={item.name} className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FUEL_COLORS[idx % FUEL_COLORS.length] }} />
                    <span className="text-[11px] font-bold text-slate-200">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold pl-3.5">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Price Trends & Brand Stats Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Price Trend Over Years */}
        <div className="saas-card p-5 space-y-4">
          <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Price Trend Over Years</h4>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getPriceTrendData()}>
                <XAxis dataKey="year" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="price" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, stroke: '#dc2626', strokeWidth: 2, fill: '#07090e' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Brands Progress Bars with Overlay Car image */}
        <div className="saas-card p-5 space-y-4 relative overflow-hidden">
          <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Top Brands by Avg Price</h4>
          
          {/* Overlay sports car profile */}
          <div className="absolute bottom-2 right-2 w-48 h-32 opacity-10 pointer-events-none">
            <img src="/predict_car.png" alt="Supercar profile" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-3 relative z-10 pt-2">
            {getBrandStats().map((item) => (
              <div key={item.brand} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">{item.brand}</span>
                  <span className="font-semibold text-red-500">₹ {item.price} L</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 rounded-full" 
                    style={{ width: `${(item.price / 35) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 5: Recent Predictions & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Predictions Table */}
        <div className="saas-card p-5 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Recent Predictions</h4>
            <button 
              onClick={() => onNavigate('prediction')} 
              className="text-[10px] text-red-500 font-bold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5 pb-2">Car Model</th>
                  <th className="py-2.5 pb-2">Year</th>
                  <th className="py-2.5 pb-2">Predicted Price</th>
                  <th className="py-2.5 pb-2">Actual Price</th>
                  <th className="py-2.5 pb-2 text-right">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {recentPredictions.map((row, idx) => {
                  const isNeg = row.diff < 0;
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-semibold text-slate-100">{row.model}</td>
                      <td className="py-3 font-medium text-slate-400">{row.year}</td>
                      <td className="py-3 font-mono font-bold">₹ {row.predicted?.toFixed(2)} L</td>
                      <td className="py-3 font-mono text-slate-400">₹ {row.actual?.toFixed(2)} L</td>
                      <td className={`py-3 font-mono text-right font-bold ${isNeg ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isNeg ? '' : '+'}{row.diff?.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance Horizontal Bar Chart backed by Car Image */}
        <div className="saas-card p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <img 
              src="/importance_car.png" 
              alt="Supercar Rear view" 
              className="w-full h-full object-cover object-bottom"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Feature Importance</h4>
            <button 
              onClick={() => onNavigate('model')} 
              className="text-[10px] text-red-500 font-bold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="h-[220px] relative z-10 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={importance.slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis dataKey="feature" type="category" stroke="#475569" fontSize={9} tickLine={false} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Bar dataKey="permutation_importance" fill="#dc2626" radius={[0, 4, 4, 0]}>
                  {importance.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#b91c1c' : (index === 1 ? '#dc2626' : '#ef4444')} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
