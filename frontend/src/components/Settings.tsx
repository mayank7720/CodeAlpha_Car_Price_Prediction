import { useState, useEffect } from 'react';
import { getModelComparison } from '../services/api';
import { Trash2, Cpu, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [metrics, setMetrics] = useState<any>(null);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const met = await getModelComparison();
        setMetrics(met);
      } catch (err) {
        console.error("Error loading model metrics in settings:", err);
      }
    };
    fetchMetrics();
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('car_prediction_history');
    setSuccessMsg("Local prediction history cleared successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const metadata = metrics?._metadata || {};
  const bestModelName = metadata.best_model || "Car Price Prediction";

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">System Settings</h1>
        <p className="text-slate-400 text-xs">
          Manage local storage data, toggle UI transitions, and view core machine learning configuration values.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Settings Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Local Storage & Cache */}
        <div className="saas-card p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Data Management</h3>
            <p className="text-[10px] text-slate-500">Manage browser local storage cache.</p>
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <p className="text-xs font-bold text-slate-300">Valuation Cache</p>
                <p className="text-[10px] text-slate-500">Clears all predictions stored in browser history.</p>
              </div>
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/15 hover:border-red-600 text-xs font-bold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-300">Micro-animations</p>
                <p className="text-[10px] text-slate-500">Toggle layout fade-in effects and transitions.</p>
              </div>
              <button 
                onClick={() => setEffectsEnabled(!effectsEnabled)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {effectsEnabled ? (
                  <ToggleRight className="w-9 h-9 text-red-500" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* System Meta config */}
        <div className="saas-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Environment Metadata</h3>
            <p className="text-[10px] text-slate-500">Trained model configuration specs.</p>
          </div>

          <div className="space-y-3 py-2 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">API Endpoint</span>
              <span className="font-mono text-slate-300">http://127.0.0.1:8000/api/v1</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Active regressor</span>
              <span className="font-mono text-red-500 font-bold">{bestModelName}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">R² accuracy</span>
              <span className="font-mono text-slate-300">
                {metrics?.[bestModelName]?.R2_Score ? `${(metrics[bestModelName].R2_Score * 100).toFixed(1)}%` : '88.1%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Dataset Listings</span>
              <span className="font-mono text-slate-300">{metadata.sample_size || '301'} records</span>
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-[10px] text-slate-500 leading-normal flex items-start gap-2">
            <Cpu className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Deployment Version: 1.0.0. Registered in Python 3.13. Tested using FastAPI + Pytest integration client suite.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
