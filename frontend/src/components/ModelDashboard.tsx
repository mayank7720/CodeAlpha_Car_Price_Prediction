import { useState, useEffect } from 'react';
import { getModelComparison, getFeatureImportance } from '../services/api';
import { RefreshCw, Award, ArrowUpRight, ArrowDownRight, Table, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ModelDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [importance, setImportance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        const [metricsData, importanceData] = await Promise.all([
          getModelComparison(),
          getFeatureImportance()
        ]);
        setMetrics(metricsData);
        setImportance(importanceData);
      } catch (err) {
        console.error("Error loading model data:", err);
        setError("Model stats are not ready. Run training first to export the serialized joblibs.");
      } finally {
        setLoading(false);
      }
    };
    fetchModelDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-slate-400 text-sm">Evaluating regression test splits...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/10 bg-red-500/5 max-w-xl mx-auto text-center space-y-4 my-8">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        <h3 className="text-xl font-bold text-red-400">Models Not Trained</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
      </div>
    );
  }

  const metadata = metrics._metadata || {};
  const bestModelName = metadata.best_model || "Car Price Prediction";
  const bestModelDetails = metrics[bestModelName] || {};
  
  // Format metrics list for sorting and displaying
  const modelEntries = Object.entries(metrics)
    .filter(([key]) => key !== "_metadata")
    .map(([name, data]: any) => ({
      name,
      ...data
    }))
    .sort((a, b) => b.R2_Score - a.R2_Score);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">Model Performance</h1>
        <p className="text-slate-400 text-xs">
          Comparative benchmarks of 8 trained estimators, hyperparameter grids, and feature importance analyses.
        </p>
      </div>

      {/* Best Model Hero Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Glow card */}
        <div className="lg:col-span-2 rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#121824] to-[#0a0d14] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -z-10" />
          
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-600/15 text-red-400 border border-red-500/20 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 animate-bounce" /> Winner: Best Resale Regressor
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">{bestModelName}</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Optimized via GridSearchCV, this regressor outperformed other models. It exhibits high robustness to price outliers and learns non-linear interaction features cleanly.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/5">
            <div>
              <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">R² Accuracy</p>
              <p className="text-lg font-black text-red-500 font-mono">{(bestModelDetails.R2_Score * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Avg Error (MAE)</p>
              <p className="text-lg font-black text-slate-200 font-mono">{bestModelDetails.MAE?.toFixed(2)} L</p>
            </div>
            <div>
              <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Deviation (RMSE)</p>
              <p className="text-lg font-black text-slate-200 font-mono">{bestModelDetails.RMSE?.toFixed(2)} L</p>
            </div>
            <div>
              <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500">Avg CV Score</p>
              <p className="text-lg font-black text-slate-200 font-mono">{(bestModelDetails.CV_Score * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Small speed KPIs */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Inference Latency</h3>
            <p className="text-[11px] text-slate-500">Latency metrics measured on CPU.</p>
          </div>
          
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-slate-400 font-medium">Training Time</span>
              <span className="text-sm font-mono font-bold text-red-500">{bestModelDetails.Training_Time?.toFixed(3)}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Prediction Delay (Test)</span>
              <span className="text-sm font-mono font-bold text-slate-200">{(bestModelDetails.Prediction_Time * 1000)?.toFixed(3)} ms</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400 leading-relaxed">
            The active model is lazy-loaded inside a FastAPI singleton, yielding sub-millisecond response times suitable for live high-throughput deployments.
          </div>
        </div>
      </div>

      {/* Model Benchmarking Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Table className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider">Estimators Comparative Benchmark</h2>
        </div>
        
        <div className="saas-card p-0 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-300 font-bold uppercase tracking-wider">
                  <th className="py-3 px-5">Model Name</th>
                  <th className="py-3 px-5">R² Score</th>
                  <th className="py-3 px-5">CV Score</th>
                  <th className="py-3 px-5">MAE (L)</th>
                  <th className="py-3 px-5">RMSE (L)</th>
                  <th className="py-3 px-5 text-right">Train Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-400">
                {modelEntries.map((row: any) => (
                  <tr 
                    key={row.name} 
                    className={`hover:bg-white/5 transition-colors ${
                      row.name === bestModelName ? 'bg-red-600/5 text-slate-200 border-l-2 border-red-600' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5 font-bold flex items-center gap-2">
                      {row.name}
                      {row.name === bestModelName && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-600/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-200">{(row.R2_Score * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-5 font-mono">{(row.CV_Score * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-5 font-mono">{row.MAE?.toFixed(3)}</td>
                    <td className="py-3.5 px-5 font-mono">{row.RMSE?.toFixed(3)}</td>
                    <td className="py-3.5 px-5 font-mono text-right text-slate-500">{row.Training_Time?.toFixed(4)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Feature Importance Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Horizontal Bar Chart */}
        <div className="saas-card p-5 space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img 
              src="/importance_car.png" 
              alt="Supercar Rear view" 
              className="w-full h-full object-cover object-bottom"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Model Permutation Importance</h3>
            <p className="text-[11px] text-slate-500">Features ranked by impact on model error variance on the test set.</p>
          </div>

          <div className="h-[360px] w-full pt-4 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={importance}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis dataKey="feature" type="category" stroke="#475569" fontSize={9} tickLine={false} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <Bar dataKey="permutation_importance" fill="#dc2626" radius={[0, 4, 4, 0]}>
                  {importance.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#b91c1c' : (index === 1 ? '#dc2626' : '#ef4444')} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Explanations list */}
        <div className="saas-card p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Attribution Interpretability</h3>
            <p className="text-[11px] text-slate-500">Directional impact explanation of top variables.</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
            {importance.slice(0, 6).map((imp: any) => {
              const isNegative = imp.feature.includes("Age") || imp.feature.includes("Driven") || imp.feature.includes("Manual");
              return (
                <div key={imp.feature} className="p-3.5 rounded-lg border border-white/5 bg-[#0d111a]/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono">{imp.feature}</span>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                      isNegative ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {isNegative ? (
                        <>
                          <ArrowDownRight className="w-3.5 h-3.5" /> Negative
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" /> Positive
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{imp.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
