import React, { useState, useEffect } from 'react';
import { getEdaPlots } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Scatter, Line, Legend 
} from 'recharts';
import { RefreshCw, TrendingDown, Info, PieChart as PieIcon, BarChart3, HelpCircle } from 'lucide-react';

const COLORS = ['#dc2626', '#b91c1c', '#ef4444', '#7f1d1d', '#475569', '#1e293b'];
const FUEL_COLORS = ['#dc2626', '#2563eb', '#10b981', '#475569'];
const TRANSMISSION_COLORS = ['#dc2626', '#475569'];

// Custom Heatmap cell component
function CorrelationMatrix({ data }: { data: { features: string[]; matrix: number[][] } }) {
  const { features, matrix } = data;
  
  const labelMap: Record<string, string> = {
    'Year': 'Age Year',
    'Selling_Price': 'Selling P',
    'Present_Price': 'Present P',
    'Kms_Driven': 'Driven Km',
    'Owner': 'Owners'
  };

  const getCellColor = (val: number) => {
    // Red to Slate divergent color scale
    const absVal = Math.abs(val);
    if (val >= 0) {
      return `rgba(220, 38, 38, ${absVal})`; // Crimson Red
    } else {
      return `rgba(71, 85, 105, ${absVal})`; // Slate Gray
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="grid gap-1.5 w-full max-w-lg" style={{ gridTemplateColumns: `repeat(${features.length + 1}, minmax(0, 1fr))` }}>
        {/* Top-left corner spacer */}
        <div className="h-10" />
        
        {/* Top Column headers */}
        {features.map(f => (
          <div key={`col-${f}`} className="h-10 flex items-center justify-center text-center text-[10px] font-extrabold font-mono text-slate-400">
            {labelMap[f] || f}
          </div>
        ))}

        {/* Matrix rows */}
        {features.map((rowFeature, rowIdx) => (
          <React.Fragment key={`row-${rowFeature}`}>
            {/* Row Header */}
            <div className="h-12 flex items-center pr-2 justify-end text-[10px] font-extrabold font-mono text-slate-400">
              {labelMap[rowFeature] || rowFeature}
            </div>
            
            {/* Row Cells */}
            {matrix[rowIdx].map((cellValue, colIdx) => (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="h-12 flex flex-col items-center justify-center rounded-lg border border-white/5 font-mono text-xs font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: getCellColor(cellValue) }}
                title={`${features[rowIdx]} vs ${features[colIdx]}: ${cellValue.toFixed(4)}`}
              >
                {cellValue.toFixed(2)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-red-600/80" /> Positive Correlation
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-600/80" /> Negative Correlation
        </div>
      </div>
    </div>
  );
}

export default function EDADashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getEdaPlots();
        setData(result);
      } catch (err) {
        console.error("Error loading EDA data:", err);
        setError("FastAPI server connection error. Start the backend to generate charts.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-slate-400 text-sm">Aggregating dataset distributions...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/10 bg-red-500/5 max-w-xl mx-auto text-center space-y-4 my-8">
        <TrendingDown className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-red-400">Loading charts failed</h3>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">Exploratory Data Analysis</h1>
        <p className="text-slate-400 text-xs">
          Interactive charts exploring patterns, distributions, correlations, and comparative dynamics.
        </p>
      </div>

      {/* Grid: Scatter + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scatter Plot with Trendline (Slope Skill) */}
        <div className="saas-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Price Depreciation Dynamics</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-600/10 text-red-500 border border-red-500/15 text-[10px] font-bold">
                Slope: {data.scatter.depreciation_slope}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Showroom Price vs Resale Price. The linear regression trendline shows the average depreciation rate.
            </p>
          </div>
          
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="present_price" 
                  name="Showroom Price" 
                  unit="L" 
                  stroke="#475569" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="selling_price" 
                  name="Resale Price" 
                  unit="L" 
                  stroke="#475569" 
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Scatter 
                  name="Car Listing" 
                  data={data.scatter.points} 
                  fill="#475569" 
                  opacity={0.5}
                />
                <Line 
                  name="Depreciation Trendline" 
                  data={data.scatter.trendline} 
                  dataKey="selling_price" 
                  stroke="#dc2626" 
                  strokeWidth={2.5} 
                  dot={false} 
                  activeDot={false} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] text-red-400 leading-relaxed mt-2">
            <strong>Slope interpretation:</strong> On average, for every 1 Lakh increase in the car's initial showroom price, the resale value increases by approximately <strong>{data.scatter.depreciation_slope} Lakhs</strong> (an effective overall depreciation multiplier of ~{(1 - data.scatter.depreciation_slope) * 100}%).
          </div>
        </div>

        {/* Correlation Heatmap */}
        <div className="saas-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Feature Correlation Matrix</h2>
            <p className="text-xs text-slate-500">
              Pearson correlation coefficients between the numerical variables.
            </p>
          </div>
          
          <div className="my-auto pt-4">
            <CorrelationMatrix data={data.correlation} />
          </div>

          <p className="text-[10px] text-slate-500 italic text-center mt-4">
            *Present Price and Selling Price exhibit a strong positive correlation (0.88), while Year (Age) correlates negatively.
          </p>
        </div>
      </div>

      {/* Grid: Brand Distribution + Fuel/Transmission Pies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Brand Distribution */}
        <div className="saas-card p-5 space-y-4 md:col-span-2">
          <div className="space-y-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Volume distribution by Brand</h3>
              <p className="text-xs text-slate-500">Total listings categorized by manufacturer.</p>
            </div>
            <BarChart3 className="w-4 h-4 text-red-500" />
          </div>
          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.brand_distribution}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="brand" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]}>
                  {data.brand_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel split */}
        <div className="saas-card p-5 space-y-4">
          <div className="space-y-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Engine Fuel split</h3>
              <p className="text-xs text-slate-500">Resale listings segmented by fuel type.</p>
            </div>
            <PieIcon className="w-4 h-4 text-red-500" />
          </div>
          <div className="h-60 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.fuel_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="fuel_type"
                >
                  {data.fuel_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={FUEL_COLORS[index % FUEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Top Fuel</span>
              <span className="text-sm font-black text-white">Petrol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Transmission + Horsepower/Engine categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Transmission Split */}
        <div className="saas-card p-5 space-y-4">
          <div className="space-y-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Transmission breakdown</h3>
              <p className="text-xs text-slate-500">Proportion of manual vs automatic entries.</p>
            </div>
            <PieIcon className="w-4 h-4 text-red-500" />
          </div>
          <div className="h-60 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.transmission_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="transmission"
                >
                  {data.transmission_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={TRANSMISSION_COLORS[index % TRANSMISSION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Gearbox</span>
              <span className="text-sm font-black text-white">Manual</span>
            </div>
          </div>
        </div>

        {/* Horsepower Category Distribution */}
        <div className="saas-card p-5 space-y-4">
          <div className="space-y-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Horsepower Classes</h3>
              <p className="text-xs text-slate-500">Car models mapped to performance levels.</p>
            </div>
            <Info className="w-4 h-4 text-red-500" />
          </div>
          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hp_distribution}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="horsepower" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]}>
                  {data.hp_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engine Class Distribution */}
        <div className="saas-card p-5 space-y-4">
          <div className="space-y-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-400">Engine Classes</h3>
              <p className="text-xs text-slate-500">Car models mapped to displacement levels.</p>
            </div>
            <HelpCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.engine_distribution}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="engine_size" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]}>
                  {data.engine_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
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
